using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Replenishment.Commands.CreateReplenishmentRequest;

public class CreateReplenishmentRequestCommandHandler : IRequestHandler<CreateReplenishmentRequestCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateReplenishmentRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateReplenishmentRequestCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Check if medication exists and user has access
        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == request.MedicationId, cancellationToken);

        if (medication == null)
        {
            throw new Exception("Medication not found.");
        }

        // Check if user has access (owner or shared patient)
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == medication.PatientId, cancellationToken);

        if (patient == null || (patient.OwnerId != userId && !patient.SharedWith.Contains(userId)))
        {
            throw new UnauthorizedAccessException("Medication not found or user does not have access.");
        }

        // 2. Create the request
        var entity = new ReplenishmentRequest(
            request.MedicationId,
            userId,
            request.RequestedQuantity,
            request.Urgency,
            request.Notes,
            medication.OwnerId // Owner of the medication is the owner of the request
        );

        _context.ReplenishmentRequests.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

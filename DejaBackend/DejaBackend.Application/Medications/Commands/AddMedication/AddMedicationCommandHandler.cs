using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.AddMedication;

public class AddMedicationCommandHandler : IRequestHandler<AddMedicationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddMedicationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddMedicationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Check if patient exists and user has access (owner or shared)
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);

        if (patient == null || (patient.OwnerId != userId && !patient.SharedWith.Contains(userId)))
        {
            throw new UnauthorizedAccessException("Patient not found or user does not have access.");
        }

        // 2. Create Medication entity (handles initial stock movement)
        var entity = new Medication(
            request.Name,
            request.Dosage,
            request.Unit,
            request.PatientId,
            request.Route,
            request.Frequency,
            request.Times,
            request.TreatmentType,
            request.TreatmentStartDate,
            request.TreatmentEndDate,
            request.HasTapering,
            request.CurrentStock,
            request.DailyConsumption,
            request.BoxQuantity,
            request.Instructions,
            userId
        );

        _context.Medications.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

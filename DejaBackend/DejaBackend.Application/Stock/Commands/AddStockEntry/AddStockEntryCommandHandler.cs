using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Stock.Commands.AddStockEntry;

public class AddStockEntryCommandHandler : IRequestHandler<AddStockEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddStockEntryCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(AddStockEntryCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == request.MedicationId, cancellationToken);

        if (medication == null)
        {
            return false;
        }

        // Check if user has access (owner or shared patient)
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == medication.PatientId, cancellationToken);

        if (patient == null || (patient.OwnerId != userId && !patient.SharedWith.Contains(userId)))
        {
            throw new UnauthorizedAccessException("Medication not found or user does not have access.");
        }

        // Update stock and add movement
        medication.UpdateStock(request.Quantity, StockMovementType.In, request.Source, userId);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

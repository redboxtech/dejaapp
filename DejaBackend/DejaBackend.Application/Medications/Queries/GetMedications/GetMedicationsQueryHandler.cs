using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Queries.GetMedications;

public class GetMedicationsQueryHandler : IRequestHandler<GetMedicationsQuery, List<MedicationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMedicationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<MedicationDto>> Handle(GetMedicationsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Get all patients the user has access to (owned or shared)
        var allPatients = await _context.Patients
            .ToListAsync(cancellationToken);
        var accessiblePatientIds = allPatients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .Select(p => p.Id)
            .ToList();

        // 2. Get all medications for those patients
        var medications = await _context.Medications
            .Where(m => accessiblePatientIds.Contains(m.PatientId))
            .Include(m => m.Patient)
            .ToListAsync(cancellationToken);

        return medications.Select(MapToDto).ToList();
    }

    private MedicationDto MapToDto(Medication medication)
    {
        return new MedicationDto(
            medication.Id,
            medication.Name,
            medication.Dosage,
            medication.Unit,
            medication.PatientId,
            medication.Patient.Name,
            medication.Route,
            medication.Frequency,
            medication.Times,
            medication.TreatmentType,
            medication.TreatmentStartDate,
            medication.TreatmentEndDate,
            medication.HasTapering,
            medication.CurrentStock,
            medication.DailyConsumption,
            medication.DaysLeft,
            medication.BoxQuantity,
            medication.Status,
            medication.Instructions,
            medication.OwnerId
        );
    }
}

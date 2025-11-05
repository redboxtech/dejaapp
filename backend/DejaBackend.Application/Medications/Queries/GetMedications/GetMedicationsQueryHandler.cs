using DejaBackend.Application.Interfaces;
using DejaBackend.Application.Prescriptions.Commands.ProcessPrescription;
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

        // 2. Get all medications for those patients (incluir movimentações para calcular estoque)
        var medications = await _context.Medications
            .Where(m => accessiblePatientIds.Contains(m.PatientId))
            .Include(m => m.Patient)
            .Include(m => m.Movements) // Incluir movimentações para calcular estoque atual
            .ToListAsync(cancellationToken);

        // 3. Buscar configurações de alertas do usuário para usar thresholds dinâmicos
        var alertSettings = await _context.AlertSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        
        // Se não existir, criar com valores padrão
        if (alertSettings == null)
        {
            alertSettings = new Domain.Entities.AlertSettings(userId);
            _context.AlertSettings.Add(alertSettings);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Usar thresholds das configurações de alertas (ou valores padrão se não configurados)
        var criticalThreshold = alertSettings.CriticalStockThreshold > 0 ? alertSettings.CriticalStockThreshold : 3;
        var lowThreshold = alertSettings.LowStockThreshold > 0 ? alertSettings.LowStockThreshold : 7;

        return medications.Select(m => MapToDto(m, criticalThreshold, lowThreshold)).ToList();
    }

    private MedicationDto MapToDto(Medication medication, int criticalThreshold, int lowThreshold)
    {
        return new MedicationDto(
            medication.Id,
            medication.Name,
            medication.Dosage,
            medication.DosageUnit,
            medication.PresentationForm,
            medication.Unit, // Mantido para compatibilidade
            medication.PatientId,
            medication.Patient.Name,
            medication.Route,
            medication.Frequency,
            medication.Times,
            medication.IsHalfDose,
            medication.CustomFrequency,
            medication.IsExtra,
            medication.TreatmentType,
            medication.TreatmentStartDate,
            medication.TreatmentEndDate,
            medication.HasTapering,
            medication.CurrentStock,
            medication.DailyConsumption,
            medication.DaysLeft,
            medication.BoxQuantity,
            CalculateStatus(medication.DaysLeft, criticalThreshold, lowThreshold), // Calcular status usando thresholds dinâmicos
            medication.Instructions,
            medication.OwnerId,
            medication.PrescriptionId,
            null // TaperingSchedule será implementado quando a entidade TaperingSchedule for criada
        );
    }

    private string CalculateStatus(int daysLeft, int criticalThreshold, int lowThreshold)
    {
        // Usar thresholds dinâmicos das configurações de alertas
        if (daysLeft <= criticalThreshold)
            return "critical";
        if (daysLeft <= lowThreshold)
            return "warning";
        return "ok";
    }
}

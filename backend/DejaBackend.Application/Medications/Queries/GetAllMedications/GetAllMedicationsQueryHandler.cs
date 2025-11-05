using DejaBackend.Application.Interfaces;
using DejaBackend.Application.Medications.Queries;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Queries.GetAllMedications;

public class GetAllMedicationsQueryHandler : IRequestHandler<GetAllMedicationsQuery, List<MedicationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAllMedicationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<MedicationDto>> Handle(GetAllMedicationsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Buscar todas as medicações do usuário (incluindo as não associadas a pacientes)
        var medications = await _context.Medications
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .Include(m => m.Movements)
            .Where(m => m.OwnerId == userId)
            .ToListAsync(cancellationToken);

        // Buscar configurações de alertas do usuário para usar thresholds dinâmicos
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
        // Mapear todos os pacientes associados com seus consumos individuais
        var patients = medication.MedicationPatients
            .Select(mp => new PatientMedicationInfo(
                mp.PatientId,
                mp.Patient.Name,
                mp.DailyConsumption
            ))
            .ToList();

        return new MedicationDto(
            medication.Id,
            medication.Name,
            medication.Dosage,
            medication.DosageUnit,
            medication.PresentationForm,
            medication.Unit,
            patients,
            medication.Route,
            "", // Frequency não existe mais na Medication (está em MedicationPatient)
            new List<string>(), // Times não existe mais na Medication (está em MedicationPatient)
            false, // IsHalfDose não existe mais na Medication (está em MedicationPatient)
            null, // CustomFrequency não existe mais na Medication (está em MedicationPatient)
            false, // IsExtra não existe mais na Medication (está em MedicationPatient)
            Domain.Enums.TreatmentType.Continuous, // TreatmentType não existe mais na Medication (está em MedicationPatient)
            DateOnly.FromDateTime(DateTime.Now), // TreatmentStartDate não existe mais na Medication (está em MedicationPatient)
            null, // TreatmentEndDate não existe mais na Medication (está em MedicationPatient)
            false, // HasTapering não existe mais na Medication (está em MedicationPatient)
            medication.CurrentStock,
            medication.TotalDailyConsumption,
            medication.DaysLeft,
            medication.BoxQuantity,
            CalculateStatus(medication.DaysLeft, criticalThreshold, lowThreshold),
            medication.Instructions,
            medication.OwnerId,
            null, // PrescriptionId não existe mais na Medication (está em MedicationPatient)
            null // TaperingSchedule não existe mais na Medication (está em MedicationPatient)
        );
    }

    private string CalculateStatus(int daysLeft, int criticalThreshold, int lowThreshold)
    {
        if (daysLeft <= criticalThreshold)
        {
            return "critical";
        }
        if (daysLeft <= lowThreshold)
        {
            return "warning";
        }
        return "ok";
    }
}


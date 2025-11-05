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

        // 2. Get all medications where at least one associated patient is accessible
        // Incluir MedicationPatients e seus Patients, e também Movements para calcular estoque
        var medications = await _context.Medications
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .Include(m => m.Movements) // Incluir movimentações para calcular estoque atual
            .Where(m => m.MedicationPatients.Any(mp => accessiblePatientIds.Contains(mp.PatientId)))
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
        // Mapear todos os pacientes associados com seus consumos individuais
        var patients = medication.MedicationPatients
            .Select(mp => new PatientMedicationInfo(
                mp.PatientId,
                mp.Patient.Name,
                mp.DailyConsumption
            ))
            .ToList();

        // Para compatibilidade com o frontend, pegar dados de posologia do primeiro paciente associado
        // Se não houver paciente associado, usar valores padrão
        var firstPatient = medication.MedicationPatients.FirstOrDefault();
        
        return new MedicationDto(
            medication.Id,
            medication.Name,
            medication.Dosage,
            medication.DosageUnit,
            medication.PresentationForm,
            medication.Unit, // Mantido para compatibilidade
            patients, // Lista de pacientes associados
            medication.Route,
            firstPatient?.Frequency ?? "", // Posologia do primeiro paciente ou vazio
            firstPatient?.Times ?? new List<string>(), // Horários do primeiro paciente ou vazio
            firstPatient?.IsHalfDose ?? false,
            firstPatient?.CustomFrequency,
            firstPatient?.IsExtra ?? false,
            firstPatient?.TreatmentType ?? Domain.Enums.TreatmentType.Continuous,
            firstPatient?.TreatmentStartDate ?? DateOnly.FromDateTime(DateTime.Now),
            firstPatient?.TreatmentEndDate,
            firstPatient?.HasTapering ?? false,
            medication.CurrentStock,
            medication.TotalDailyConsumption, // Consumo total = soma de todos os pacientes
            medication.DaysLeft,
            medication.BoxQuantity,
            CalculateStatus(medication.DaysLeft, criticalThreshold, lowThreshold), // Calcular status usando thresholds dinâmicos
            medication.Instructions,
            medication.OwnerId,
            firstPatient?.PrescriptionId, // PrescriptionId está em MedicationPatient agora
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

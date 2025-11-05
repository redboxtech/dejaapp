using DejaBackend.Domain.Enums;
using DejaBackend.Application.Prescriptions.Commands.ProcessPrescription;

namespace DejaBackend.Application.Medications.Queries;

public record MedicationDto(
    Guid Id,
    string Name,
    decimal Dosage,
    string DosageUnit, // Unidade de medida da dosagem (mg, g, ml, etc.)
    string PresentationForm, // Forma de apresentação (comprimido, cápsula, gotas, etc.)
    string Unit, // Mantido para compatibilidade - será removido depois
    // Lista de pacientes associados à medicação com seus consumos individuais
    List<PatientMedicationInfo> Patients,
    string Route,
    string Frequency,
    List<string> Times,
    bool IsHalfDose, // Meia dose (1/2 comprimido por administração)
    string? CustomFrequency, // Frequência personalizada (ex: "a cada 2 dias")
    bool IsExtra, // Medicação extra/avulsa
    TreatmentType TreatmentType,
    DateOnly TreatmentStartDate,
    DateOnly? TreatmentEndDate,
    bool HasTapering,
    // TaperingSchedule is complex, simplifying for now
    decimal CurrentStock,
    decimal TotalDailyConsumption, // Consumo total = soma de todos os pacientes
    int DaysLeft,
    decimal BoxQuantity,
    string Status, // Status como string (ok, warning, critical)
    string Instructions,
    Guid OwnerId,
    Guid? PrescriptionId, // ID da receita associada (opcional)
    List<TaperingPhaseData>? TaperingSchedule // Adicionado
);

/// <summary>
/// Informações de um paciente associado à medicação
/// </summary>
public record PatientMedicationInfo(
    Guid PatientId,
    string PatientName,
    decimal DailyConsumption // Consumo diário específico deste paciente
);

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
    Guid PatientId,
    string PatientName, // Added for convenience
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
    decimal DailyConsumption,
    int DaysLeft,
    decimal BoxQuantity,
    string Status, // Status como string (ok, warning, critical)
    string Instructions,
    Guid OwnerId,
    Guid? PrescriptionId, // ID da receita associada (opcional)
    List<TaperingPhaseData>? TaperingSchedule // Adicionado
);

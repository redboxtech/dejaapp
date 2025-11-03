using DejaBackend.Domain.Enums;

namespace DejaBackend.Application.Medications.Queries;

public record MedicationDto(
    Guid Id,
    string Name,
    decimal Dosage,
    string Unit,
    Guid PatientId,
    string PatientName, // Added for convenience
    string Route,
    string Frequency,
    List<string> Times,
    TreatmentType TreatmentType,
    DateOnly TreatmentStartDate,
    DateOnly? TreatmentEndDate,
    bool HasTapering,
    // TaperingSchedule is complex, simplifying for now
    decimal CurrentStock,
    decimal DailyConsumption,
    int DaysLeft,
    decimal BoxQuantity,
    StockStatus Status,
    string Instructions,
    Guid OwnerId
);

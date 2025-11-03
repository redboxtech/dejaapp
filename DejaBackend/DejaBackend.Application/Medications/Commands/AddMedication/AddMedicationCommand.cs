using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Medications.Commands.AddMedication;

public record AddMedicationCommand : IRequest<Guid>
{
    public string Name { get; init; } = string.Empty;
    public decimal Dosage { get; init; }
    public string Unit { get; init; } = string.Empty;
    public Guid PatientId { get; init; }
    public string Route { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public List<string> Times { get; init; } = new();
    public TreatmentType TreatmentType { get; init; }
    public DateOnly TreatmentStartDate { get; init; }
    public DateOnly? TreatmentEndDate { get; init; }
    public bool HasTapering { get; init; }
    // TaperingSchedule is complex, simplifying for now
    public decimal CurrentStock { get; init; }
    public decimal DailyConsumption { get; init; }
    public decimal BoxQuantity { get; init; }
    public string Instructions { get; init; } = string.Empty;
}

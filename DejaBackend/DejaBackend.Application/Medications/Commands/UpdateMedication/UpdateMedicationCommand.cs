using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Medications.Commands.UpdateMedication;

public record UpdateMedicationCommand : IRequest<bool>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Dosage { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string Route { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public List<string> Times { get; init; } = new();
    public TreatmentType TreatmentType { get; init; }
    public DateOnly TreatmentStartDate { get; init; }
    public DateOnly? TreatmentEndDate { get; init; }
    public bool HasTapering { get; init; }
    public decimal DailyConsumption { get; init; }
    public decimal BoxQuantity { get; init; }
    public string Instructions { get; init; } = string.Empty;
}

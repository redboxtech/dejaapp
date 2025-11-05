using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Medications.Commands.UpdateMedicationPatient;

public record UpdateMedicationPatientCommand : IRequest<bool>
{
    public Guid MedicationId { get; init; }
    public Guid PatientId { get; init; }
    public string Frequency { get; init; } = string.Empty;
    public List<string> Times { get; init; } = new();
    public bool IsHalfDose { get; init; }
    public string? CustomFrequency { get; init; }
    public bool IsExtra { get; init; }
    public TreatmentType TreatmentType { get; init; }
    public DateOnly TreatmentStartDate { get; init; }
    public DateOnly? TreatmentEndDate { get; init; }
    public bool HasTapering { get; init; }
    public decimal DailyConsumption { get; init; }
    public Guid? PrescriptionId { get; init; }
}


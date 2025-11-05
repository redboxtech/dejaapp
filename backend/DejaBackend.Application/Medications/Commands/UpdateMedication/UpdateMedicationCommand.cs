using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Medications.Commands.UpdateMedication;

public record UpdateMedicationCommand : IRequest<bool>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Dosage { get; init; }
    public string DosageUnit { get; init; } = string.Empty; // Unidade de medida da dosagem (mg, g, ml, etc.)
    public string PresentationForm { get; init; } = string.Empty; // Forma de apresentação (comprimido, cápsula, gotas, etc.)
    public string Unit { get; init; } = string.Empty; // Mantido para compatibilidade - será removido depois
    public string Route { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public List<string> Times { get; init; } = new();
    public bool? IsHalfDose { get; init; } // Meia dose (1/2 comprimido por administração)
    public string? CustomFrequency { get; init; } // Frequência personalizada (ex: "a cada 2 dias")
    public bool? IsExtra { get; init; } // Medicação extra/avulsa
    public TreatmentType? TreatmentType { get; init; } // Opcional para permitir atualização parcial
    public DateOnly TreatmentStartDate { get; init; }
    public DateOnly? TreatmentEndDate { get; init; }
    public bool HasTapering { get; init; }
    public decimal DailyConsumption { get; init; }
    public decimal BoxQuantity { get; init; }
    public string Instructions { get; init; } = string.Empty;
}

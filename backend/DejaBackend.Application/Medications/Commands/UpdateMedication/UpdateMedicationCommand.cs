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
    // Posologia removida - agora está em MedicationPatient e deve ser atualizada separadamente
    public decimal BoxQuantity { get; init; }
    public string Instructions { get; init; } = string.Empty;
}

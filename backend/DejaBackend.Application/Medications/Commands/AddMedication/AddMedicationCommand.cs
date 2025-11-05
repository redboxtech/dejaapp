using MediatR;

namespace DejaBackend.Application.Medications.Commands.AddMedication;

/// <summary>
/// Comando para adicionar uma nova medicação (apenas informações da medicação, sem posologia)
/// A posologia será adicionada posteriormente através do comando AddMedicationToPatient
/// </summary>
public record AddMedicationCommand : IRequest<Guid>
{
    public string Name { get; init; } = string.Empty;
    public decimal Dosage { get; init; }
    public string DosageUnit { get; init; } = string.Empty; // Unidade de medida da dosagem (mg, g, ml, etc.)
    public string PresentationForm { get; init; } = string.Empty; // Forma de apresentação (comprimido, cápsula, gotas, etc.)
    public string Route { get; init; } = string.Empty;
    public decimal InitialStock { get; init; } // Estoque inicial - será registrado como movimentação
    public decimal BoxQuantity { get; init; }
    public string Instructions { get; init; } = string.Empty;
}

using MediatR;

namespace DejaBackend.Application.Medications.Commands.RemoveMedicationFromPatient;

/// <summary>
/// Comando para remover a associação entre uma medicação e um paciente
/// Remove apenas a associação (MedicationPatient), não exclui a medicação do sistema
/// </summary>
public record RemoveMedicationFromPatientCommand : IRequest<bool>
{
    public Guid MedicationId { get; init; }
    public Guid PatientId { get; init; }
}


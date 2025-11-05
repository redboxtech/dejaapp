using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Medications.Commands.AddMedicationToPatient;

/// <summary>
/// Comando para adicionar uma medicação a um paciente com posologia específica
/// </summary>
public record AddMedicationToPatientCommand : IRequest<Guid>
{
    public Guid MedicationId { get; init; }
    public Guid PatientId { get; init; }
    public string Frequency { get; init; } = string.Empty;
    public List<string> Times { get; init; } = new();
    public bool IsHalfDose { get; init; } // Meia dose (1/2 comprimido por administração)
    public string? CustomFrequency { get; init; } // Frequência personalizada (ex: "a cada 2 dias")
    public bool IsExtra { get; init; } // Medicação extra/avulsa
    public TreatmentType TreatmentType { get; init; }
    public DateOnly TreatmentStartDate { get; init; }
    public DateOnly? TreatmentEndDate { get; init; }
    public bool HasTapering { get; init; }
    public decimal DailyConsumption { get; init; } // Consumo diário específico deste paciente
    public Guid? PrescriptionId { get; init; } // ID da receita associada (opcional)
}


using MediatR;

namespace DejaBackend.Application.Prescriptions.Commands.ProcessPrescription;

public record ProcessPrescriptionCommand : IRequest<Guid>
{
    public Guid PrescriptionId { get; init; }
    public List<MedicationFromPrescription> Medications { get; init; } = new(); // Novas medicações a criar
    public List<Guid> ExistingMedicationIds { get; init; } = new(); // IDs de medicações existentes para associar
}

public record MedicationFromPrescription
{
    public string Name { get; init; } = string.Empty;
    public decimal Dosage { get; init; }
    public string DosageUnit { get; init; } = string.Empty; // Unidade de medida da dosagem (mg, g, ml, etc.)
    public string PresentationForm { get; init; } = string.Empty; // Forma de apresentação (comprimido, cápsula, gotas, etc.)
    public string Unit { get; init; } = string.Empty; // Mantido para compatibilidade - será removido depois
    public string Route { get; init; } = string.Empty; // "Oral", "Tópica", etc.
    public string Frequency { get; init; } = string.Empty; // "Diário", "Semanal", etc.
    public List<string> Times { get; init; } = new(); // ["08:00", "20:00"]
    public bool IsHalfDose { get; init; } // Meia dose (1/2 comprimido por administração)
    public string? CustomFrequency { get; init; } // Frequência personalizada (ex: "a cada 2 dias")
    public bool IsExtra { get; init; } // Medicação extra/avulsa
    public int TreatmentType { get; init; } // 0 = continuo, 1 = temporario
    public string TreatmentStartDate { get; init; } = string.Empty; // "yyyy-MM-dd"
    public string? TreatmentEndDate { get; init; } // "yyyy-MM-dd"
    public bool HasTapering { get; init; }
    public List<TaperingPhaseData>? TaperingSchedule { get; init; } // Esquema de tapering
    public decimal CurrentStock { get; init; }
    public decimal DailyConsumption { get; init; }
    public decimal BoxQuantity { get; init; }
    public string? Instructions { get; init; }
}

public record TaperingPhaseData
{
    public string Phase { get; init; } = string.Empty; // "aumento", "manutencao", "reducao", "finalizado"
    public string StartDate { get; init; } = string.Empty; // "yyyy-MM-dd"
    public string? EndDate { get; init; } // "yyyy-MM-dd"
    public decimal Dosage { get; init; }
    public string Frequency { get; init; } = string.Empty;
    public string Instructions { get; init; } = string.Empty;
}


using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

/// <summary>
/// Entidade de ligação many-to-many entre Medication e Patient
/// Contém a posologia (frequência, horários, tratamento) específica para cada paciente
/// Permite que uma medicação seja associada a múltiplos pacientes com posologias diferentes
/// </summary>
public class MedicationPatient
{
    public Guid MedicationId { get; private set; }
    public Medication Medication { get; private set; } = null!;
    
    public Guid PatientId { get; private set; }
    public Patient Patient { get; private set; } = null!;
    
    // Posologia específica deste paciente para esta medicação
    public string Frequency { get; private set; } = string.Empty;
    public List<string> Times { get; private set; } = new();
    public bool IsHalfDose { get; private set; } // Meia dose (1/2 comprimido por administração)
    public string? CustomFrequency { get; private set; } // Frequência personalizada (ex: "a cada 2 dias")
    public bool IsExtra { get; private set; } // Medicação extra/avulsa
    public TreatmentType TreatmentType { get; private set; }
    public DateOnly TreatmentStartDate { get; private set; }
    public DateOnly? TreatmentEndDate { get; private set; }
    public bool HasTapering { get; private set; }
    
    // Consumo diário específico deste paciente para esta medicação
    public decimal DailyConsumption { get; private set; }
    
    // Associação com receita (opcional)
    public Guid? PrescriptionId { get; private set; }
    public Prescription? Prescription { get; private set; }
    
    // EF Core constructor
    private MedicationPatient() 
    {
        Frequency = string.Empty;
    }
    
    public MedicationPatient(
        Guid medicationId, 
        Guid patientId, 
        string frequency,
        List<string> times,
        bool isHalfDose,
        string? customFrequency,
        bool isExtra,
        TreatmentType treatmentType,
        DateOnly treatmentStartDate,
        DateOnly? treatmentEndDate,
        bool hasTapering,
        decimal dailyConsumption,
        Guid? prescriptionId = null)
    {
        MedicationId = medicationId;
        PatientId = patientId;
        Frequency = frequency;
        Times = times;
        IsHalfDose = isHalfDose;
        CustomFrequency = customFrequency;
        IsExtra = isExtra;
        TreatmentType = treatmentType;
        TreatmentStartDate = treatmentStartDate;
        TreatmentEndDate = treatmentEndDate;
        HasTapering = hasTapering;
        DailyConsumption = dailyConsumption;
        PrescriptionId = prescriptionId;
    }
    
    public void UpdateDailyConsumption(decimal dailyConsumption)
    {
        DailyConsumption = dailyConsumption;
    }
    
    public void UpdatePosology(
        string frequency,
        List<string> times,
        bool isHalfDose,
        string? customFrequency,
        bool isExtra,
        TreatmentType treatmentType,
        DateOnly treatmentStartDate,
        DateOnly? treatmentEndDate,
        bool hasTapering,
        decimal dailyConsumption,
        Guid? prescriptionId = null)
    {
        Frequency = frequency;
        Times = times;
        IsHalfDose = isHalfDose;
        CustomFrequency = customFrequency;
        IsExtra = isExtra;
        TreatmentType = treatmentType;
        TreatmentStartDate = treatmentStartDate;
        TreatmentEndDate = treatmentEndDate;
        HasTapering = hasTapering;
        DailyConsumption = dailyConsumption;
        if (prescriptionId.HasValue)
        {
            PrescriptionId = prescriptionId;
        }
    }
}


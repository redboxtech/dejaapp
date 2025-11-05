using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class Medication
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public decimal Dosage { get; private set; }
    public string DosageUnit { get; private set; } // Unidade de medida da dosagem (mg, g, ml, etc.)
    public string PresentationForm { get; private set; } // Forma de apresentação (comprimido, cápsula, gotas, etc.)
    public string Unit { get; private set; } // Mantido para compatibilidade - será removido depois
    public Guid PatientId { get; private set; }
    public Patient Patient { get; private set; }
    public string Route { get; private set; }
    public string Frequency { get; private set; }
    public List<string> Times { get; private set; } = new();
    public bool IsHalfDose { get; private set; } // Meia dose (1/2 comprimido por administração)
    public string? CustomFrequency { get; private set; } // Frequência personalizada (ex: "a cada 2 dias")
    public bool IsExtra { get; private set; } // Medicação extra/avulsa
    public TreatmentType TreatmentType { get; private set; }
    public DateOnly TreatmentStartDate { get; private set; }
    public DateOnly? TreatmentEndDate { get; private set; }
    public bool HasTapering { get; private set; }
    // TaperingSchedule will be a separate entity or complex type if needed, for now, simplify
    
    public decimal DailyConsumption { get; private set; }
    public decimal BoxQuantity { get; private set; }
    public StockStatus Status { get; private set; }
    
    // Propriedades calculadas (não armazenadas no banco)
    public decimal CurrentStock => CalculateCurrentStock();
    public int DaysLeft => CalculateDaysLeft();
    public string Instructions { get; private set; }
    public Guid OwnerId { get; private set; }
    public Guid? PrescriptionId { get; private set; } // Associação com receita
    public Prescription? Prescription { get; private set; }

    public ICollection<StockMovement> Movements { get; private set; } = new List<StockMovement>();

    // EF Core constructor
    private Medication() { }

    public Medication(
        string name, decimal dosage, string dosageUnit, string presentationForm, Guid patientId, string route, string frequency,
        List<string> times, bool isHalfDose, string? customFrequency, bool isExtra, TreatmentType treatmentType, DateOnly treatmentStartDate, DateOnly? treatmentEndDate,
        bool hasTapering, decimal initialStock, decimal dailyConsumption, decimal boxQuantity, string instructions, Guid ownerId, Guid? prescriptionId = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Dosage = dosage;
        DosageUnit = dosageUnit;
        PresentationForm = presentationForm;
        Unit = dosageUnit; // Mantido para compatibilidade - será removido depois
        PatientId = patientId;
        Route = route;
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
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        OwnerId = ownerId;
        PrescriptionId = prescriptionId;
        
        // Initial stock movement - estoque inicial é registrado como movimentação
        if (initialStock > 0)
        {
            Movements.Add(new StockMovement(Id, StockMovementType.In, initialStock, "Estoque Inicial", ownerId));
        }
        
        UpdateStockStatus();
    }

    public void UpdateStock(decimal quantity, StockMovementType type, string source, Guid userId, decimal? price = null, int? totalInstallments = null)
    {
        // Apenas adiciona a movimentação - o estoque é calculado dinamicamente
        Movements.Add(new StockMovement(Id, type, quantity, source, userId, price, totalInstallments));
        UpdateStockStatus();
    }

    public void UpdateDetails(
        string name, decimal dosage, string dosageUnit, string presentationForm, string route, string frequency,
        List<string> times, bool isHalfDose, string? customFrequency, bool isExtra, TreatmentType treatmentType, DateOnly treatmentStartDate, DateOnly? treatmentEndDate,
        bool hasTapering, decimal dailyConsumption, decimal boxQuantity, string instructions)
    {
        Name = name;
        Dosage = dosage;
        DosageUnit = dosageUnit;
        PresentationForm = presentationForm;
        Unit = dosageUnit; // Mantido para compatibilidade - será removido depois
        Route = route;
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
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        
        UpdateStockStatus();
    }

    public void UpdatePrescriptionId(Guid? prescriptionId)
    {
        PrescriptionId = prescriptionId;
    }

    private void UpdateStockStatus()
    {
        var daysLeft = CalculateDaysLeft();
        // <= 3 dias = Crítico, <= 7 dias = Atenção, > 7 dias = Normal
        Status = daysLeft <= 3 ? StockStatus.Critical : daysLeft <= 7 ? StockStatus.Warning : StockStatus.Ok;
    }
    
    // Calcula o estoque atual a partir das movimentações
    private decimal CalculateCurrentStock()
    {
        if (Movements == null || !Movements.Any())
            return 0;
        
        var entries = Movements.Where(m => m.Type == StockMovementType.In).Sum(m => m.Quantity);
        var exits = Movements.Where(m => m.Type == StockMovementType.Out).Sum(m => m.Quantity);
        return entries - exits;
    }
    
    // Calcula os dias restantes baseado no estoque atual e consumo diário
    private int CalculateDaysLeft()
    {
        if (DailyConsumption <= 0)
            return 0;
        
        var currentStock = CalculateCurrentStock();
        return (int)Math.Floor(currentStock / DailyConsumption);
    }
}

using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class Medication
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public decimal Dosage { get; private set; }
    public string Unit { get; private set; } // MedicationUnit
    public Guid PatientId { get; private set; }
    public Patient Patient { get; private set; }
    public string Route { get; private set; }
    public string Frequency { get; private set; }
    public List<string> Times { get; private set; } = new();
    public TreatmentType TreatmentType { get; private set; }
    public DateOnly TreatmentStartDate { get; private set; }
    public DateOnly? TreatmentEndDate { get; private set; }
    public bool HasTapering { get; private set; }
    // TaperingSchedule will be a separate entity or complex type if needed, for now, simplify
    
    public decimal CurrentStock { get; private set; }
    public decimal DailyConsumption { get; private set; }
    public int DaysLeft { get; private set; }
    public decimal BoxQuantity { get; private set; }
    public StockStatus Status { get; private set; }
    public string Instructions { get; private set; }
    public Guid OwnerId { get; private set; }

    public ICollection<StockMovement> Movements { get; private set; } = new List<StockMovement>();

    // EF Core constructor
    private Medication() { }

    public Medication(
        string name, decimal dosage, string unit, Guid patientId, string route, string frequency,
        List<string> times, TreatmentType treatmentType, DateOnly treatmentStartDate, DateOnly? treatmentEndDate,
        bool hasTapering, decimal currentStock, decimal dailyConsumption, decimal boxQuantity, string instructions, Guid ownerId)
    {
        Id = Guid.NewGuid();
        Name = name;
        Dosage = dosage;
        Unit = unit;
        PatientId = patientId;
        Route = route;
        Frequency = frequency;
        Times = times;
        TreatmentType = treatmentType;
        TreatmentStartDate = treatmentStartDate;
        TreatmentEndDate = treatmentEndDate;
        HasTapering = hasTapering;
        CurrentStock = currentStock;
        DailyConsumption = dailyConsumption;
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        OwnerId = ownerId;
        
        UpdateStockStatus();
        
        // Initial stock movement
        Movements.Add(new StockMovement(Id, StockMovementType.In, currentStock, "Initial Stock", ownerId));
    }

    public void UpdateStock(decimal quantity, StockMovementType type, string source, Guid userId)
    {
        if (type == StockMovementType.In)
        {
            CurrentStock += quantity;
        }
        else if (type == StockMovementType.Out)
        {
            CurrentStock -= quantity;
        }
        
        Movements.Add(new StockMovement(Id, type, quantity, source, userId));
        UpdateStockStatus();
    }

    public void UpdateDetails(
        string name, decimal dosage, string unit, string route, string frequency,
        List<string> times, TreatmentType treatmentType, DateOnly treatmentStartDate, DateOnly? treatmentEndDate,
        bool hasTapering, decimal dailyConsumption, decimal boxQuantity, string instructions)
    {
        Name = name;
        Dosage = dosage;
        Unit = unit;
        Route = route;
        Frequency = frequency;
        Times = times;
        TreatmentType = treatmentType;
        TreatmentStartDate = treatmentStartDate;
        TreatmentEndDate = treatmentEndDate;
        HasTapering = hasTapering;
        DailyConsumption = dailyConsumption;
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        
        UpdateStockStatus();
    }

    private void UpdateStockStatus()
    {
        if (DailyConsumption > 0)
        {
            DaysLeft = (int)Math.Floor(CurrentStock / DailyConsumption);
            Status = DaysLeft < 3 ? StockStatus.Critical : DaysLeft < 7 ? StockStatus.Warning : StockStatus.Ok;
        }
        else
        {
            DaysLeft = 0;
            Status = StockStatus.Ok; // Assume OK if no consumption
        }
    }
}

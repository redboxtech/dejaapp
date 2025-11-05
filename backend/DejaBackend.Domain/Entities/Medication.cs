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
    // Relacionamento many-to-many com Patient através de MedicationPatient
    // A posologia (frequência, horários, tratamento) está em MedicationPatient, não em Medication
    public ICollection<MedicationPatient> MedicationPatients { get; private set; } = new List<MedicationPatient>();
    public string Route { get; private set; }
    
    // DailyConsumption agora é calculado a partir da soma dos consumos de todos os pacientes
    // Removido: public decimal DailyConsumption { get; private set; }
    public decimal BoxQuantity { get; private set; }
    public StockStatus Status { get; private set; }
    
    // Propriedades calculadas (não armazenadas no banco)
    public decimal CurrentStock => CalculateCurrentStock();
    // Consumo diário total = soma dos consumos de todos os pacientes associados
    public decimal TotalDailyConsumption => MedicationPatients?.Sum(mp => mp.DailyConsumption) ?? 0;
    public int DaysLeft => CalculateDaysLeft();
    public string Instructions { get; private set; }
    public Guid OwnerId { get; private set; }
    // PrescriptionId foi movido para MedicationPatient (cada paciente pode ter uma receita diferente)

    public ICollection<StockMovement> Movements { get; private set; } = new List<StockMovement>();

    // EF Core constructor
    private Medication() 
    {
        // Inicializar propriedades não-nuláveis para evitar avisos do compilador
        // EF Core irá preencher essas propriedades ao carregar do banco de dados
        Name = string.Empty;
        DosageUnit = string.Empty;
        PresentationForm = string.Empty;
        Unit = string.Empty;
        Route = string.Empty;
        Instructions = string.Empty;
    }

    public Medication(
        string name, 
        decimal dosage, 
        string dosageUnit, 
        string presentationForm, 
        string route, 
        decimal initialStock, 
        decimal boxQuantity, 
        string instructions, 
        Guid ownerId)
    {
        Id = Guid.NewGuid();
        Name = name;
        Dosage = dosage;
        DosageUnit = dosageUnit;
        PresentationForm = presentationForm;
        Unit = dosageUnit; // Mantido para compatibilidade - será removido depois
        Route = route;
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        OwnerId = ownerId;
        
        // Initial stock movement - estoque inicial é registrado como movimentação
        if (initialStock > 0)
        {
            Movements.Add(new StockMovement(Id, StockMovementType.In, initialStock, "Estoque Inicial", ownerId));
        }
        
        UpdateStockStatus();
    }
    
    // Método para adicionar um paciente à medicação com posologia
    public void AddPatient(
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
        if (MedicationPatients == null)
        {
            MedicationPatients = new List<MedicationPatient>();
        }
        
        // Verificar se o paciente já está associado
        if (!MedicationPatients.Any(mp => mp.PatientId == patientId))
        {
            MedicationPatients.Add(new MedicationPatient(
                Id, 
                patientId, 
                frequency,
                times,
                isHalfDose,
                customFrequency,
                isExtra,
                treatmentType,
                treatmentStartDate,
                treatmentEndDate,
                hasTapering,
                dailyConsumption,
                prescriptionId));
            UpdateStockStatus();
        }
    }
    
    // Método para remover um paciente da medicação
    public void RemovePatient(Guid patientId)
    {
        if (MedicationPatients != null)
        {
            var medicationPatient = MedicationPatients.FirstOrDefault(mp => mp.PatientId == patientId);
            if (medicationPatient != null)
            {
                MedicationPatients.Remove(medicationPatient);
                UpdateStockStatus();
            }
        }
    }
    
    // Método para atualizar o consumo diário de um paciente específico
    public void UpdatePatientDailyConsumption(Guid patientId, decimal dailyConsumption)
    {
        var medicationPatient = MedicationPatients?.FirstOrDefault(mp => mp.PatientId == patientId);
        if (medicationPatient != null)
        {
            medicationPatient.UpdateDailyConsumption(dailyConsumption);
            UpdateStockStatus();
        }
    }

    public void UpdateStock(decimal quantity, StockMovementType type, string source, Guid userId, decimal? price = null, int? totalInstallments = null)
    {
        // Apenas adiciona a movimentação - o estoque é calculado dinamicamente
        Movements.Add(new StockMovement(Id, type, quantity, source, userId, price, totalInstallments));
        UpdateStockStatus();
    }

    public void UpdateDetails(
        string name, 
        decimal dosage, 
        string dosageUnit, 
        string presentationForm, 
        string route, 
        decimal boxQuantity, 
        string instructions)
    {
        Name = name;
        Dosage = dosage;
        DosageUnit = dosageUnit;
        PresentationForm = presentationForm;
        Unit = dosageUnit; // Mantido para compatibilidade - será removido depois
        Route = route;
        BoxQuantity = boxQuantity;
        Instructions = instructions;
        
        UpdateStockStatus();
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
    
    // Calcula os dias restantes baseado no estoque atual e consumo diário total (soma de todos os pacientes)
    private int CalculateDaysLeft()
    {
        var totalDailyConsumption = TotalDailyConsumption;
        if (totalDailyConsumption <= 0)
            return 0;
        
        var currentStock = CalculateCurrentStock();
        return (int)Math.Floor(currentStock / totalDailyConsumption);
    }
}

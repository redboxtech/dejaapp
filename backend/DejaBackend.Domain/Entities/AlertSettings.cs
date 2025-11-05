namespace DejaBackend.Domain.Entities;

public class AlertSettings
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    
    // Medication Delay
    public bool MedicationDelayEnabled { get; private set; }
    public int MedicationDelayMinutes { get; private set; }
    public List<string> MedicationDelayChannels { get; private set; } = new();
    
    // Low Stock
    public bool LowStockEnabled { get; private set; }
    public int LowStockThreshold { get; private set; } // Dias de estoque baixo
    public List<string> LowStockChannels { get; private set; } = new();
    
    // Critical Stock
    public bool CriticalStockEnabled { get; private set; }
    public int CriticalStockThreshold { get; private set; } // Dias de estoque crítico
    public List<string> CriticalStockChannels { get; private set; } = new();
    
    // Prescription Expiry
    public bool PrescriptionExpiryEnabled { get; private set; }
    public int PrescriptionExpiryDefaultDays { get; private set; }
    public List<string> PrescriptionExpiryChannels { get; private set; } = new();
    
    // Replenishment Request
    public bool ReplenishmentRequestEnabled { get; private set; }
    public List<string> ReplenishmentRequestChannels { get; private set; } = new();
    
    // Quiet Hours
    public bool QuietHoursEnabled { get; private set; }
    public string QuietHoursStartTime { get; private set; } = string.Empty;
    public string QuietHoursEndTime { get; private set; } = string.Empty;
    
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // EF Core constructor
    private AlertSettings() { }

    public AlertSettings(Guid userId)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        
        // Valores padrão
        MedicationDelayEnabled = true;
        MedicationDelayMinutes = 30;
        MedicationDelayChannels = new List<string> { "push", "email" };
        
        LowStockEnabled = true;
        LowStockThreshold = 7; // 7 dias padrão
        LowStockChannels = new List<string> { "push", "email" };
        
        CriticalStockEnabled = true;
        CriticalStockThreshold = 3; // 3 dias padrão
        CriticalStockChannels = new List<string> { "push", "email", "whatsapp" };
        
        PrescriptionExpiryEnabled = true;
        PrescriptionExpiryDefaultDays = 14;
        PrescriptionExpiryChannels = new List<string> { "push", "email" };
        
        ReplenishmentRequestEnabled = true;
        ReplenishmentRequestChannels = new List<string> { "push", "email" };
        
        QuietHoursEnabled = true;
        QuietHoursStartTime = "22:00";
        QuietHoursEndTime = "07:00";
        
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        bool medicationDelayEnabled, int medicationDelayMinutes, List<string> medicationDelayChannels,
        bool lowStockEnabled, int lowStockThreshold, List<string> lowStockChannels,
        bool criticalStockEnabled, int criticalStockThreshold, List<string> criticalStockChannels,
        bool prescriptionExpiryEnabled, int prescriptionExpiryDefaultDays, List<string> prescriptionExpiryChannels,
        bool replenishmentRequestEnabled, List<string> replenishmentRequestChannels,
        bool quietHoursEnabled, string quietHoursStartTime, string quietHoursEndTime)
    {
        MedicationDelayEnabled = medicationDelayEnabled;
        MedicationDelayMinutes = medicationDelayMinutes;
        MedicationDelayChannels = medicationDelayChannels;
        
        LowStockEnabled = lowStockEnabled;
        LowStockThreshold = lowStockThreshold;
        LowStockChannels = lowStockChannels;
        
        CriticalStockEnabled = criticalStockEnabled;
        CriticalStockThreshold = criticalStockThreshold;
        CriticalStockChannels = criticalStockChannels;
        
        PrescriptionExpiryEnabled = prescriptionExpiryEnabled;
        PrescriptionExpiryDefaultDays = prescriptionExpiryDefaultDays;
        PrescriptionExpiryChannels = prescriptionExpiryChannels;
        
        ReplenishmentRequestEnabled = replenishmentRequestEnabled;
        ReplenishmentRequestChannels = replenishmentRequestChannels;
        
        QuietHoursEnabled = quietHoursEnabled;
        QuietHoursStartTime = quietHoursStartTime;
        QuietHoursEndTime = quietHoursEndTime;
        
        UpdatedAt = DateTime.UtcNow;
    }
}

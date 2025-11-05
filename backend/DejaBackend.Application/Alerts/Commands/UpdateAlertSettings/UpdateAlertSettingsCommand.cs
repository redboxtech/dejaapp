using MediatR;

namespace DejaBackend.Application.Alerts.Commands.UpdateAlertSettings;

public record UpdateAlertSettingsCommand : IRequest<bool>
{
    public bool MedicationDelayEnabled { get; init; }
    public int MedicationDelayMinutes { get; init; }
    public List<string> MedicationDelayChannels { get; init; } = new();
    
    public bool LowStockEnabled { get; init; }
    public int LowStockThreshold { get; init; }
    public List<string> LowStockChannels { get; init; } = new();
    
    public bool CriticalStockEnabled { get; init; }
    public int CriticalStockThreshold { get; init; }
    public List<string> CriticalStockChannels { get; init; } = new();
    
    public bool PrescriptionExpiryEnabled { get; init; }
    public int PrescriptionExpiryDefaultDays { get; init; }
    public List<string> PrescriptionExpiryChannels { get; init; } = new();
    
    public bool ReplenishmentRequestEnabled { get; init; }
    public List<string> ReplenishmentRequestChannels { get; init; } = new();
    
    public bool QuietHoursEnabled { get; init; }
    public string QuietHoursStartTime { get; init; } = string.Empty;
    public string QuietHoursEndTime { get; init; } = string.Empty;
}


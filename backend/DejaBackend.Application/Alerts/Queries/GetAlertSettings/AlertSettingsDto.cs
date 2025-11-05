namespace DejaBackend.Application.Alerts.Queries.GetAlertSettings;

public record AlertSettingsDto(
    bool MedicationDelayEnabled,
    int MedicationDelayMinutes,
    List<string> MedicationDelayChannels,
    bool LowStockEnabled,
    int LowStockThreshold,
    List<string> LowStockChannels,
    bool CriticalStockEnabled,
    int CriticalStockThreshold,
    List<string> CriticalStockChannels,
    bool PrescriptionExpiryEnabled,
    int PrescriptionExpiryDefaultDays,
    List<string> PrescriptionExpiryChannels,
    bool ReplenishmentRequestEnabled,
    List<string> ReplenishmentRequestChannels,
    bool QuietHoursEnabled,
    string QuietHoursStartTime,
    string QuietHoursEndTime
);

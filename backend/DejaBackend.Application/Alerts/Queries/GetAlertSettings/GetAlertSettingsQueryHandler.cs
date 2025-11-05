using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Alerts.Queries.GetAlertSettings;

public class GetAlertSettingsQueryHandler : IRequestHandler<GetAlertSettingsQuery, AlertSettingsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAlertSettingsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<AlertSettingsDto> Handle(GetAlertSettingsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var settings = await _context.AlertSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);

        // Se não existir, criar com valores padrão
        if (settings == null)
        {
            var newSettings = new Domain.Entities.AlertSettings(userId);
            _context.AlertSettings.Add(newSettings);
            await _context.SaveChangesAsync(cancellationToken);
            settings = newSettings;
        }

        return new AlertSettingsDto(
            settings.MedicationDelayEnabled,
            settings.MedicationDelayMinutes,
            settings.MedicationDelayChannels,
            settings.LowStockEnabled,
            settings.LowStockThreshold,
            settings.LowStockChannels,
            settings.CriticalStockEnabled,
            settings.CriticalStockThreshold,
            settings.CriticalStockChannels,
            settings.PrescriptionExpiryEnabled,
            settings.PrescriptionExpiryDefaultDays,
            settings.PrescriptionExpiryChannels,
            settings.ReplenishmentRequestEnabled,
            settings.ReplenishmentRequestChannels,
            settings.QuietHoursEnabled,
            settings.QuietHoursStartTime,
            settings.QuietHoursEndTime
        );
    }
}

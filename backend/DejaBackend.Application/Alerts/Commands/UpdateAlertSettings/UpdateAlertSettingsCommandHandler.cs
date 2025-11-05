using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Alerts.Commands.UpdateAlertSettings;

public class UpdateAlertSettingsCommandHandler : IRequestHandler<UpdateAlertSettingsCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAlertSettingsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateAlertSettingsCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var settings = await _context.AlertSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);

        // Se não existir, criar
        if (settings == null)
        {
            settings = new Domain.Entities.AlertSettings(userId);
            _context.AlertSettings.Add(settings);
        }

        settings.Update(
            request.MedicationDelayEnabled,
            request.MedicationDelayMinutes,
            request.MedicationDelayChannels,
            request.LowStockEnabled,
            request.LowStockThreshold,
            request.LowStockChannels,
            request.CriticalStockEnabled,
            request.CriticalStockThreshold,
            request.CriticalStockChannels,
            request.PrescriptionExpiryEnabled,
            request.PrescriptionExpiryDefaultDays,
            request.PrescriptionExpiryChannels,
            request.ReplenishmentRequestEnabled,
            request.ReplenishmentRequestChannels,
            request.QuietHoursEnabled,
            request.QuietHoursStartTime,
            request.QuietHoursEndTime
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


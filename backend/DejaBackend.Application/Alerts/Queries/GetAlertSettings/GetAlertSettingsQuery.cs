using MediatR;

namespace DejaBackend.Application.Alerts.Queries.GetAlertSettings;

public record GetAlertSettingsQuery : IRequest<AlertSettingsDto>;


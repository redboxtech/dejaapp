using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Commands.DeleteCaregiverSchedule;

public record DeleteCaregiverScheduleCommand(Guid Id) : IRequest<bool>;


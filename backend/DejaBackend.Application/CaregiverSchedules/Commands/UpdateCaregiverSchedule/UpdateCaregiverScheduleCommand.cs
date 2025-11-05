using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Commands.UpdateCaregiverSchedule;

public record UpdateCaregiverScheduleCommand(
    Guid Id,
    Guid CaregiverId,
    Guid PatientId,
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime
) : IRequest<bool>;


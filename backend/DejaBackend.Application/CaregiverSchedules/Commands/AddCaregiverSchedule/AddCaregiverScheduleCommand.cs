using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Commands.AddCaregiverSchedule;

public record AddCaregiverScheduleCommand(
    Guid CaregiverId,
    Guid PatientId,
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime
) : IRequest<Guid>;


using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Commands.AddCaregiverSchedule;

public record AddCaregiverScheduleCommand(
    Guid CaregiverId,
    List<Guid> PatientIds, // Mudado de PatientId para PatientIds (lista)
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime
) : IRequest<Guid>;


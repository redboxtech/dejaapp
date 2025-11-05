using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Commands.UpdateCaregiverSchedule;

public record UpdateCaregiverScheduleCommand(
    Guid Id,
    Guid CaregiverId,
    List<Guid> PatientIds, // Mudado de PatientId para PatientIds (lista)
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime
) : IRequest<bool>;


namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverSchedules;

public record CaregiverScheduleDto(
    Guid Id,
    Guid CaregiverId,
    string CaregiverName,
    Guid PatientId,
    string PatientName,
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime,
    DateTime CreatedAt
);


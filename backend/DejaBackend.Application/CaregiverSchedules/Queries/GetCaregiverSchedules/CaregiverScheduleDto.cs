namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverSchedules;

public record CaregiverScheduleDto(
    Guid Id,
    Guid CaregiverId,
    string CaregiverName,
    List<PatientInfo> Patients, // Mudado de PatientId/PatientName para lista de pacientes
    List<string> DaysOfWeek,
    string StartTime,
    string EndTime,
    DateTime CreatedAt
);

public record PatientInfo(
    Guid PatientId,
    string PatientName
);


namespace DejaBackend.Application.Caregivers.Queries.GetCaregivers;

public record CaregiverDto(
    Guid Id,
    string Name,
    string? Email,
    string Phone,
    List<Guid> Patients,
    string AddedAt,
    string Status,
    string? Color
);


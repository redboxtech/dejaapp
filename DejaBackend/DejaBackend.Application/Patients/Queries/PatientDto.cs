using DejaBackend.Domain.Enums;

namespace DejaBackend.Application.Patients.Queries;

public record PatientDto(
    Guid Id,
    string Name,
    int Age,
    DateOnly BirthDate,
    string CareType,
    int Medications, // Will be calculated in the handler
    int Caregivers, // Will be calculated in the handler
    string LastUpdate, // Will be calculated in the handler
    int CriticalAlerts, // Will be calculated in the handler
    string Observations,
    Guid OwnerId,
    List<Guid> SharedWith,
    DateTime CreatedAt
);

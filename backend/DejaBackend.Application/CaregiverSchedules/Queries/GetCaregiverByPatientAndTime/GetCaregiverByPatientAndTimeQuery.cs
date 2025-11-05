using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverByPatientAndTime;

public record GetCaregiverByPatientAndTimeQuery(
    Guid PatientId,
    string Time,
    DayOfWeek DayOfWeek
) : IRequest<string?>; // Returns caregiver name or null


using MediatR;

namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverSchedules;

public record GetCaregiverSchedulesQuery : IRequest<List<CaregiverScheduleDto>>;


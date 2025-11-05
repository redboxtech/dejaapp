using MediatR;

namespace DejaBackend.Application.Caregivers.Queries.GetCaregivers;

public record GetCaregiversQuery : IRequest<List<CaregiverDto>>;


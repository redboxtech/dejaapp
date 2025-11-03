using MediatR;

namespace DejaBackend.Application.Representatives.Queries.GetRepresentatives;

public record GetRepresentativesQuery : IRequest<List<RepresentativeDto>>;


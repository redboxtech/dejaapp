using MediatR;

namespace DejaBackend.Application.Replenishment.Queries.GetReplenishmentRequests;

public record GetReplenishmentRequestsQuery : IRequest<List<ReplenishmentRequestDto>>;

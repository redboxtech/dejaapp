using MediatR;

namespace DejaBackend.Application.Replenishment.Commands.ApproveReplenishmentRequest;

public record ApproveReplenishmentRequestCommand : IRequest<bool>
{
    public Guid RequestId { get; init; }
    public decimal QuantityAdded { get; init; }
}

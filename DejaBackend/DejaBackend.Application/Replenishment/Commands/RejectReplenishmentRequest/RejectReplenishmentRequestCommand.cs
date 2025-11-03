using MediatR;

namespace DejaBackend.Application.Replenishment.Commands.RejectReplenishmentRequest;

public record RejectReplenishmentRequestCommand(Guid RequestId) : IRequest<bool>;

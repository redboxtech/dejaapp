using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Replenishment.Commands.CreateReplenishmentRequest;

public record CreateReplenishmentRequestCommand : IRequest<Guid>
{
    public Guid MedicationId { get; init; }
    public decimal RequestedQuantity { get; init; }
    public Urgency Urgency { get; init; }
    public string Notes { get; init; } = string.Empty;
}

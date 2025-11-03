using MediatR;

namespace DejaBackend.Application.Stock.Commands.AddStockEntry;

public record AddStockEntryCommand : IRequest<bool>
{
    public Guid MedicationId { get; init; }
    public decimal Quantity { get; init; }
    public string Source { get; init; } = string.Empty;
}

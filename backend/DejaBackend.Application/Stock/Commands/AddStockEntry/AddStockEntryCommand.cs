using MediatR;

namespace DejaBackend.Application.Stock.Commands.AddStockEntry;

public record AddStockEntryCommand : IRequest<bool>
{
    public Guid MedicationId { get; init; }
    public decimal Quantity { get; init; }
    public string Source { get; init; } = string.Empty;
    public decimal? Price { get; init; } // Preço (opcional, apenas para Farmácia)
    public int? TotalInstallments { get; init; } // Número total de parcelas (opcional, apenas para Farmácia)
}

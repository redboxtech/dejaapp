using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class StockMovement
{
    public Guid Id { get; private set; }
    public Guid MedicationId { get; private set; }
    public StockMovementType Type { get; private set; }
    public decimal Quantity { get; private set; }
    public DateTime Date { get; private set; }
    public string Source { get; private set; }
    public decimal? Price { get; private set; } // Preço (opcional, apenas para Farmácia)
    public int? TotalInstallments { get; private set; } // Número total de parcelas (null ou 1 = à vista)
    public Guid OwnerId { get; private set; }

    // EF Core constructor
    private StockMovement() { }

    public StockMovement(Guid medicationId, StockMovementType type, decimal quantity, string source, Guid ownerId, decimal? price = null, int? totalInstallments = null)
    {
        Id = Guid.NewGuid();
        MedicationId = medicationId;
        Type = type;
        Quantity = quantity;
        Date = DateTime.UtcNow;
        Source = source;
        Price = price;
        TotalInstallments = totalInstallments;
        OwnerId = ownerId;
    }
}

namespace DejaBackend.Application.Stock.Queries.GetStock;

public record StockItemDto(
    Guid Id,
    string Medication,
    Guid MedicationId,
    string Patient,
    decimal Current,
    decimal DailyConsumption,
    int DaysLeft,
    string EstimatedEndDate,
    decimal BoxQuantity,
    string Unit,
    string Status,
    List<StockMovementDto> Movements,
    Guid OwnerId
);

public record StockMovementDto(
    string Type,
    decimal Quantity,
    string Date,
    string Source
);


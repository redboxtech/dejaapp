using MediatR;

namespace DejaBackend.Application.Stock.Queries.GetStock;

public record GetStockQuery : IRequest<List<StockItemDto>>;


using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Stock.Queries.GetStock;

public class GetStockQueryHandler : IRequestHandler<GetStockQuery, List<StockItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStockQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<StockItemDto>> Handle(GetStockQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var medications = await _context.Medications
            .AsNoTracking()
            .Include(m => m.Patient)
            .Include(m => m.Movements)
            .Where(m => m.OwnerId == userId)
            .ToListAsync(cancellationToken);

        return medications.Select(m => new StockItemDto(
            m.Id,
            $"{m.Name} {m.Dosage}{m.Unit}",
            m.Id,
            m.Patient?.Name ?? string.Empty,
            m.CurrentStock,
            m.DailyConsumption,
            m.DaysLeft,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(m.DaysLeft)).ToString("yyyy-MM-dd"),
            m.BoxQuantity,
            m.Unit,
            m.Status.ToString().ToLower(),
            m.Movements
                .OrderByDescending(x => x.Date)
                .Take(50)
                .Select(x => new StockMovementDto(
                    x.Type == StockMovementType.In ? "in" : "out",
                    x.Quantity,
                    x.Date.ToString("yyyy-MM-dd"),
                    x.Source
                ))
                .ToList(),
            userId
        )).ToList();
    }
}


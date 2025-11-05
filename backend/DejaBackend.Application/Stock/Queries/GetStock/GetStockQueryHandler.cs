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

        // Buscar configurações de alertas para usar thresholds dinâmicos
        var alertSettings = await _context.AlertSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        
        // Se não existir, usar valores padrão
        var criticalThreshold = alertSettings?.CriticalStockThreshold ?? 3;
        var lowThreshold = alertSettings?.LowStockThreshold ?? 7;

        var medications = await _context.Medications
            .AsNoTracking()
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .Include(m => m.Movements) // Incluir movimentações para calcular estoque atual
            .Where(m => m.OwnerId == userId)
            .ToListAsync(cancellationToken);

        return medications.Select(m => new StockItemDto(
            m.Id,
            $"{m.Name} {(m.Dosage % 1 == 0 ? m.Dosage.ToString("0") : m.Dosage.ToString("0.##"))} {m.DosageUnit}",
            m.Id,
            string.Join(", ", m.MedicationPatients.Select(mp => mp.Patient.Name)), // Lista de pacientes separados por vírgula
            m.CurrentStock,
            m.TotalDailyConsumption, // Consumo total = soma de todos os pacientes
            m.DaysLeft,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(m.DaysLeft)).ToString("yyyy-MM-dd"),
            m.BoxQuantity,
            m.PresentationForm, // Usar PresentationForm para estoque (comprimidos, gotas, etc.)
            m.Unit, // Mantido para compatibilidade
            CalculateStatus(m.DaysLeft, criticalThreshold, lowThreshold), // Calcular status usando thresholds dinâmicos
            m.Movements
                .OrderByDescending(x => x.Date)
                .Take(50)
                .Select(x => new StockMovementDto(
                    x.Type == StockMovementType.In ? "in" : "out",
                    x.Quantity,
                    x.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                    x.Source
                ))
                .ToList(),
            userId
        )).ToList();
    }

    private string CalculateStatus(int daysLeft, int criticalThreshold, int lowThreshold)
    {
        // Usar thresholds dinâmicos das configurações de alertas
        if (daysLeft <= criticalThreshold)
            return "critical";
        if (daysLeft <= lowThreshold)
            return "warning";
        return "ok";
    }
}


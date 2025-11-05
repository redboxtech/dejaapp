using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Stock.Queries.GetMonthlyExpenses;

public class GetMonthlyExpensesQueryHandler : IRequestHandler<GetMonthlyExpensesQuery, decimal>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMonthlyExpensesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<decimal> Handle(GetMonthlyExpensesQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Data de início e fim do mês atual
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

        // Buscar todos os pacientes que o usuário tem acesso
        var allPatients = await _context.Patients
            .ToListAsync(cancellationToken);
        var accessiblePatientIds = allPatients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .Select(p => p.Id)
            .ToList();

        // Buscar todos os medicamentos dos pacientes acessíveis
        var medicationIds = await _context.Medications
            .Where(m => accessiblePatientIds.Contains(m.PatientId))
            .Select(m => m.Id)
            .ToListAsync(cancellationToken);

        // Buscar todas as movimentações de entrada (In) que têm preço preenchido
        var allMovements = await _context.StockMovements
            .Where(m => medicationIds.Contains(m.MedicationId) &&
                       m.Type == StockMovementType.In &&
                       m.Price.HasValue)
            .ToListAsync(cancellationToken);

        decimal monthlyExpenses = 0;

        foreach (var movement in allMovements)
        {
            // Se não tem parcelas (ou TotalInstallments = 1 ou null), considerar apenas se for do mês atual
            if (!movement.TotalInstallments.HasValue || movement.TotalInstallments.Value <= 1)
            {
                if (movement.Date >= startOfMonth && movement.Date <= endOfMonth)
                {
                    monthlyExpenses += movement.Price!.Value;
                }
            }
            else
            {
                // Compra parcelada: calcular quantas parcelas caem neste mês
                var totalInstallments = movement.TotalInstallments.Value;
                var installmentValue = movement.Price!.Value / totalInstallments;
                var purchaseDate = movement.Date;
                
                // Para cada parcela, verificar se cai no mês atual
                for (int installmentNumber = 1; installmentNumber <= totalInstallments; installmentNumber++)
                {
                    // A parcela número N é paga no mês: purchaseDate + (N-1) meses
                    var installmentMonth = purchaseDate.AddMonths(installmentNumber - 1);
                    
                    // Verificar se esta parcela cai no mês atual
                    if (installmentMonth.Year == now.Year && installmentMonth.Month == now.Month)
                    {
                        monthlyExpenses += installmentValue;
                    }
                }
            }
        }

        return monthlyExpenses;
    }
}


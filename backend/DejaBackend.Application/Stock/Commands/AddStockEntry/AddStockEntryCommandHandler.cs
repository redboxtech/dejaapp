using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Stock.Commands.AddStockEntry;

public class AddStockEntryCommandHandler : IRequestHandler<AddStockEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddStockEntryCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(AddStockEntryCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var medication = await _context.Medications
            .Include(m => m.Movements)
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .AsTracking() // Garantir que a entidade seja rastreada
            .FirstOrDefaultAsync(m => m.Id == request.MedicationId, cancellationToken);

        if (medication == null)
        {
            return false;
        }

        // Verificar se o usuário tem acesso (owner ou paciente compartilhado)
        // Verificar se o usuário é o dono OU se tem acesso a pelo menos um paciente associado
        bool hasAccess = medication.OwnerId == userId;
        
        if (!hasAccess)
        {
            // Verificar se tem acesso a algum paciente associado
            var accessiblePatients = medication.MedicationPatients
                .Where(mp => mp.Patient.OwnerId == userId || mp.Patient.SharedWith.Contains(userId))
                .Any();
            
            if (!accessiblePatients)
            {
                throw new UnauthorizedAccessException("Medication not found or user does not have access.");
            }
        }

        // Usar o método UpdateStock da entidade que adiciona o movimento à coleção e atualiza o status
        // Cada nova entrada cria um novo registro na tabela StockMovements
        medication.UpdateStock(request.Quantity, StockMovementType.In, request.Source, userId, request.Price, request.TotalInstallments);
        
        // Garantir que o novo movimento seja rastreado pelo EF Core
        // O UpdateStock adiciona o movimento à coleção Movements, mas precisamos adicionar ao DbSet
        var newMovement = medication.Movements.LastOrDefault();
        if (newMovement != null)
        {
            // Adicionar explicitamente ao DbSet para garantir que seja salvo no banco
            // Cada nova entrada cria um novo registro na tabela StockMovements
            // O estoque atual é calculado como: soma de todas as entradas - soma de todas as saídas
            _context.StockMovements.Add(newMovement);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

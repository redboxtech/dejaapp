using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Replenishment.Commands.CreateReplenishmentRequest;

public class CreateReplenishmentRequestCommandHandler : IRequestHandler<CreateReplenishmentRequestCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateReplenishmentRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateReplenishmentRequestCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Verificar se a medicação existe e o usuário tem acesso
        var medication = await _context.Medications
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .FirstOrDefaultAsync(m => m.Id == request.MedicationId, cancellationToken);

        if (medication == null)
        {
            throw new Exception("Medication not found.");
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

        // 2. Create the request
        var entity = new ReplenishmentRequest(
            request.MedicationId,
            userId,
            request.RequestedQuantity,
            request.Urgency,
            request.Notes,
            medication.OwnerId // Owner of the medication is the owner of the request
        );

        _context.ReplenishmentRequests.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

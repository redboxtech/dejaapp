using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.AddMedication;

public class AddMedicationCommandHandler : IRequestHandler<AddMedicationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddMedicationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddMedicationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Criar entidade Medication (apenas informações da medicação, sem posologia)
        // A posologia será adicionada posteriormente através do comando AddMedicationToPatient
        var entity = new Medication(
            request.Name,
            request.Dosage,
            request.DosageUnit,
            request.PresentationForm,
            request.Route,
            request.InitialStock, // Estoque inicial será registrado como movimentação
            request.BoxQuantity,
            request.Instructions,
            userId
        );

        _context.Medications.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

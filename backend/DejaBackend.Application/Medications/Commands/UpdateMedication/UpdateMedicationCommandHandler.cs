using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.UpdateMedication;

public class UpdateMedicationCommandHandler : IRequestHandler<UpdateMedicationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateMedicationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateMedicationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var entity = await _context.Medications
            .Include(m => m.Movements) // Incluir movimentações para calcular estoque atual
            .Include(m => m.MedicationPatients) // Incluir pacientes associados
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return false;
        }

        // Only the owner can update the medication details
        if (entity.OwnerId != _currentUserService.UserId.Value)
        {
            throw new UnauthorizedAccessException("Only the owner can update this medication.");
        }

        // Atualizar apenas informações da medicação (sem posologia)
        // A posologia está em MedicationPatient e deve ser atualizada separadamente
        entity.UpdateDetails(
            request.Name,
            request.Dosage,
            request.DosageUnit,
            request.PresentationForm,
            request.Route,
            request.BoxQuantity,
            request.Instructions
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.DeleteMedication;

public class DeleteMedicationCommandHandler : IRequestHandler<DeleteMedicationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteMedicationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteMedicationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var entity = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return false;
        }

        // Only the owner can delete the medication
        if (entity.OwnerId != _currentUserService.UserId.Value)
        {
            throw new UnauthorizedAccessException("Only the owner can delete this medication.");
        }

        _context.Medications.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Caregivers.Commands.DeleteCaregiver;

public class DeleteCaregiverCommandHandler : IRequestHandler<DeleteCaregiverCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCaregiverCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteCaregiverCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        var caregiver = await _context.Caregivers
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.OwnerId == ownerId, cancellationToken);

        if (caregiver == null)
        {
            return false;
        }

        _context.Caregivers.Remove(caregiver);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


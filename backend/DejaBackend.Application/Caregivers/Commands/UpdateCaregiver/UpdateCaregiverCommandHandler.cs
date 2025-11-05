using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Caregivers.Commands.UpdateCaregiver;

public class UpdateCaregiverCommandHandler : IRequestHandler<UpdateCaregiverCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCaregiverCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateCaregiverCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var caregiver = await _context.Caregivers
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.OwnerId == userId, cancellationToken);

        if (caregiver == null)
        {
            return false;
        }

        caregiver.Update(
            request.Name,
            request.Email,
            request.Phone,
            request.Patients ?? new List<Guid>(),
            request.Color
        );

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}


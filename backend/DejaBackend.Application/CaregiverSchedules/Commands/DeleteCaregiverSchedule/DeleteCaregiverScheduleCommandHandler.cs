using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.CaregiverSchedules.Commands.DeleteCaregiverSchedule;

public class DeleteCaregiverScheduleCommandHandler : IRequestHandler<DeleteCaregiverScheduleCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCaregiverScheduleCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteCaregiverScheduleCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var schedule = await _context.CaregiverSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.OwnerId == userId, cancellationToken);

        if (schedule == null)
        {
            return false;
        }

        _context.CaregiverSchedules.Remove(schedule);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


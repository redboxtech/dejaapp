using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.CaregiverSchedules.Commands.UpdateCaregiverSchedule;

public class UpdateCaregiverScheduleCommandHandler : IRequestHandler<UpdateCaregiverScheduleCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCaregiverScheduleCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateCaregiverScheduleCommand request, CancellationToken cancellationToken)
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

        // Verify caregiver exists and belongs to user
        var caregiver = await _context.Caregivers
            .FirstOrDefaultAsync(c => c.Id == request.CaregiverId && c.OwnerId == userId, cancellationToken);

        if (caregiver == null)
        {
            throw new ArgumentException("Caregiver not found or user does not have access.");
        }

        // Verify patient exists and belongs to user
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.PatientId && 
                (p.OwnerId == userId || p.SharedWith.Contains(userId)), cancellationToken);

        if (patient == null)
        {
            throw new ArgumentException("Patient not found or user does not have access.");
        }

        schedule.Update(
            request.CaregiverId,
            request.PatientId,
            request.DaysOfWeek,
            request.StartTime,
            request.EndTime
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


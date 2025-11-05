using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.CaregiverSchedules.Commands.AddCaregiverSchedule;

public class AddCaregiverScheduleCommandHandler : IRequestHandler<AddCaregiverScheduleCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddCaregiverScheduleCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddCaregiverScheduleCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

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

        var schedule = new CaregiverSchedule(
            request.CaregiverId,
            request.PatientId,
            request.DaysOfWeek,
            request.StartTime,
            request.EndTime,
            userId
        );

        _context.CaregiverSchedules.Add(schedule);
        await _context.SaveChangesAsync(cancellationToken);

        return schedule.Id;
    }
}


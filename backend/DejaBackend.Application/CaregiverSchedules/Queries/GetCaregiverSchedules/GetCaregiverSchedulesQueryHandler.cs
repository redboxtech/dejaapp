using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverSchedules;

public class GetCaregiverSchedulesQueryHandler : IRequestHandler<GetCaregiverSchedulesQuery, List<CaregiverScheduleDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCaregiverSchedulesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CaregiverScheduleDto>> Handle(GetCaregiverSchedulesQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Get all accessible patients (owned or shared)
        var accessiblePatientIds = await _context.Patients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var schedules = await _context.CaregiverSchedules
            .AsNoTracking()
            .Include(s => s.Caregiver)
            .Include(s => s.Patient)
            .Where(s => s.OwnerId == userId && accessiblePatientIds.Contains(s.PatientId))
            .ToListAsync(cancellationToken);

        return schedules.Select(s => new CaregiverScheduleDto(
            s.Id,
            s.CaregiverId,
            s.Caregiver?.Name ?? string.Empty,
            s.PatientId,
            s.Patient?.Name ?? string.Empty,
            s.DaysOfWeek,
            s.StartTime,
            s.EndTime,
            s.CreatedAt
        )).ToList();
    }
}


using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverByPatientAndTime;

public class GetCaregiverByPatientAndTimeQueryHandler : IRequestHandler<GetCaregiverByPatientAndTimeQuery, string?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCaregiverByPatientAndTimeQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<string?> Handle(GetCaregiverByPatientAndTimeQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        var userId = _currentUserService.UserId.Value;

        // Map DayOfWeek to Portuguese day names
        var dayNames = new Dictionary<DayOfWeek, string>
        {
            { DayOfWeek.Monday, "Segunda" },
            { DayOfWeek.Tuesday, "Terça" },
            { DayOfWeek.Wednesday, "Quarta" },
            { DayOfWeek.Thursday, "Quinta" },
            { DayOfWeek.Friday, "Sexta" },
            { DayOfWeek.Saturday, "Sábado" },
            { DayOfWeek.Sunday, "Domingo" }
        };

        var dayName = dayNames[request.DayOfWeek];

        // Parse time (HH:mm format)
        if (!TimeSpan.TryParse(request.Time, out var medicationTime))
        {
            return null;
        }

        var schedules = await _context.CaregiverSchedules
            .AsNoTracking()
            .Include(s => s.Caregiver)
            .Include(s => s.CaregiverSchedulePatients)
            .Where(s => s.OwnerId == userId &&
                       s.DaysOfWeek.Contains(dayName) &&
                       s.CaregiverSchedulePatients.Any(csp => csp.PatientId == request.PatientId))
            .ToListAsync(cancellationToken);

        foreach (var schedule in schedules)
        {
            if (TimeSpan.TryParse(schedule.StartTime, out var startTime) &&
                TimeSpan.TryParse(schedule.EndTime, out var endTime))
            {
                // Check if the period crosses midnight (endTime <= startTime)
                // Example: 19:00 to 08:00 means from 19:00 to 23:59 OR from 00:00 to 08:00
                bool crossesMidnight = endTime <= startTime;

                if (crossesMidnight)
                {
                    // Night period: medication time is valid if it's >= startTime (e.g., 19:00) 
                    // OR <= endTime (e.g., 08:00)
                    if (medicationTime >= startTime || medicationTime <= endTime)
                    {
                        return schedule.Caregiver?.Name;
                    }
                }
                else
                {
                    // Normal period: medication time must be between startTime and endTime
                    if (medicationTime >= startTime && medicationTime <= endTime)
                    {
                        return schedule.Caregiver?.Name;
                    }
                }
            }
        }

        return null;
    }
}


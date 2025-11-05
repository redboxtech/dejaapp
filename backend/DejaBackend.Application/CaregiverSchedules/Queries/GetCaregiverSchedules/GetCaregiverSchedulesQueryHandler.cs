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
        // Buscar todos os pacientes primeiro e filtrar em memória (SharedWith pode ter problemas com Contains em SQL)
        var allPatients = await _context.Patients
            .ToListAsync(cancellationToken);
        
        var accessiblePatientIds = allPatients
            .Where(p => p.OwnerId == userId || (p.SharedWith != null && p.SharedWith.Contains(userId)))
            .Select(p => p.Id)
            .ToList();

        var schedules = await _context.CaregiverSchedules
            .AsNoTracking()
            .Include(s => s.Caregiver)
            .Include(s => s.CaregiverSchedulePatients)
                .ThenInclude(csp => csp.Patient)
            .Where(s => s.OwnerId == userId)
            .ToListAsync(cancellationToken);

        // Filtrar escalas que têm pelo menos um paciente acessível
        var filteredSchedules = schedules.Where(s => 
            s.CaregiverSchedulePatients.Any(csp => accessiblePatientIds.Contains(csp.PatientId))
        ).ToList();

        return filteredSchedules.Select(s => new CaregiverScheduleDto(
            s.Id,
            s.CaregiverId,
            s.Caregiver?.Name ?? string.Empty,
            s.CaregiverSchedulePatients
                .Where(csp => accessiblePatientIds.Contains(csp.PatientId))
                .Select(csp => new PatientInfo(
                    csp.PatientId,
                    csp.Patient?.Name ?? string.Empty
                ))
                .ToList(),
            s.DaysOfWeek,
            s.StartTime,
            s.EndTime,
            s.CreatedAt
        )).ToList();
    }
}


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
            .Include(s => s.CaregiverSchedulePatients)
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

        // Verify all patients exist and belong to user
        // Buscar todos os pacientes primeiro e verificar acesso em memória (SharedWith pode ter problemas com Contains em SQL)
        var allPatients = await _context.Patients
            .Where(p => request.PatientIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (allPatients.Count != request.PatientIds.Count)
        {
            throw new ArgumentException("One or more patients not found.");
        }

        // Verificar acesso em memória para todos os pacientes
        foreach (var patient in allPatients)
        {
            if (patient.OwnerId != userId && (patient.SharedWith == null || !patient.SharedWith.Contains(userId)))
            {
                throw new ArgumentException($"Patient '{patient.Name}' not found or user does not have access.");
            }
        }

        schedule.Update(
            request.CaregiverId,
            request.PatientIds,
            request.DaysOfWeek,
            request.StartTime,
            request.EndTime
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


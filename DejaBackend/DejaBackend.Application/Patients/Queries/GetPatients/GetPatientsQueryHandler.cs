using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Patients.Queries.GetPatients;

public class GetPatientsQueryHandler : IRequestHandler<GetPatientsQuery, List<PatientDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetPatientsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<PatientDto>> Handle(GetPatientsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Get patients owned by the user OR shared with the user
        // Buscar pacientes sem navegar por Medications (evita problemas de mapeamento/FKs)
        var patients = await _context.Patients
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        patients = patients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .ToList();

        // Buscar medicações dos pacientes acessíveis e agrupar em memória
        var patientIds = patients.Select(p => p.Id).ToList();
        var meds = await _context.Medications
            .AsNoTracking()
            .Where(m => patientIds.Contains(m.PatientId))
            .ToListAsync(cancellationToken);

        return patients.Select(p => MapToDto(p, meds.Where(m => m.PatientId == p.Id).ToList(), userId)).ToList();
    }

    private PatientDto MapToDto(Patient patient, List<Medication> medications, Guid currentUserId)
    {
        // Placeholder for calculation logic (Medications, Caregivers, Alerts, LastUpdate)
        // This logic is complex and should be implemented in a dedicated service for clean architecture.
        // For now, we'll use placeholder values to match the DTO structure.
        
        var medicationsCount = medications.Count;
        var criticalAlerts = medications.Count(m => m.Status == Domain.Enums.StockStatus.Critical);
        var caregiversCount = patient.SharedWith.Count + 1; // Owner + SharedWith
        var lastUpdate = "Just now"; // Simplification

        return new PatientDto(
            patient.Id,
            patient.Name,
            patient.Age,
            patient.BirthDate,
            patient.CareType.ToString(),
            medicationsCount,
            caregiversCount,
            lastUpdate,
            criticalAlerts,
            patient.Observations,
            patient.OwnerId,
            patient.SharedWith
        );
    }
}

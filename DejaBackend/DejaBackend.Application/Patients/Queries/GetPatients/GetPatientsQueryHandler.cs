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
        var patients = await _context.Patients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .Include(p => p.Medications)
            .ToListAsync(cancellationToken);

        return patients.Select(p => MapToDto(p, userId)).ToList();
    }

    private PatientDto MapToDto(Patient patient, Guid currentUserId)
    {
        // Placeholder for calculation logic (Medications, Caregivers, Alerts, LastUpdate)
        // This logic is complex and should be implemented in a dedicated service for clean architecture.
        // For now, we'll use placeholder values to match the DTO structure.
        
        var medicationsCount = patient.Medications.Count;
        var criticalAlerts = patient.Medications.Count(m => m.Status == Domain.Enums.StockStatus.Critical);
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

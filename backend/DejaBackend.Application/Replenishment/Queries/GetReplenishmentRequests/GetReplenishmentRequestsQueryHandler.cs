using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Replenishment.Queries.GetReplenishmentRequests;

public class GetReplenishmentRequestsQueryHandler : IRequestHandler<GetReplenishmentRequestsQuery, List<ReplenishmentRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetReplenishmentRequestsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<ReplenishmentRequestDto>> Handle(GetReplenishmentRequestsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Get requests where the current user is the owner of the medication (OwnerId)
        // OR the current user is the one who requested it (RequestedBy)
        var requests = await _context.ReplenishmentRequests
            .Where(r => r.OwnerId == userId || r.RequestedBy == userId)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync(cancellationToken);

        // Fetch related data (Medication, MedicationPatients, RequestedBy User)
        var medicationIds = requests.Select(r => r.MedicationId).Distinct().ToList();
        var medications = await _context.Medications
            .Include(m => m.MedicationPatients)
                .ThenInclude(mp => mp.Patient)
            .Where(m => medicationIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, m => m, cancellationToken);

        var userIds = requests.Select(r => r.RequestedBy).Distinct().ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u, cancellationToken);

        return requests.Select(r => MapToDto(r, medications, users)).ToList();
    }

    private ReplenishmentRequestDto MapToDto(
        ReplenishmentRequest request, 
        Dictionary<Guid, Medication> medications, 
        Dictionary<Guid, User> users)
    {
        var medication = medications.GetValueOrDefault(request.MedicationId);
        var requestedBy = users.GetValueOrDefault(request.RequestedBy);

        // Pegar o primeiro paciente associado ou lista de pacientes
        var patientNames = medication?.MedicationPatients?
            .Select(mp => mp.Patient.Name)
            .ToList() ?? new List<string>();
        var patientName = patientNames.Any() 
            ? string.Join(", ", patientNames) 
            : "Unknown Patient";

        return new ReplenishmentRequestDto(
            request.Id,
            request.MedicationId,
            medication?.Name ?? "Unknown Medication",
            patientName,
            request.RequestedBy,
            requestedBy?.Name ?? "Unknown User",
            request.RequestDate,
            request.RequestedQuantity,
            request.Urgency,
            request.Status,
            request.Notes,
            request.CompletedDate,
            request.AddedQuantity,
            request.OwnerId
        );
    }
}

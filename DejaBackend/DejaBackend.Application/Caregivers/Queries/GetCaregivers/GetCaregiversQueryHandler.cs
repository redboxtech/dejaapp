using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Caregivers.Queries.GetCaregivers;

public class GetCaregiversQueryHandler : IRequestHandler<GetCaregiversQuery, List<CaregiverDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCaregiversQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CaregiverDto>> Handle(GetCaregiversQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        var caregivers = await _context.Caregivers
            .AsNoTracking()
            .Where(c => c.OwnerId == ownerId)
            .ToListAsync(cancellationToken);

        return caregivers.Select(c => new CaregiverDto(
            c.Id,
            c.Name,
            c.Email,
            c.Phone,
            c.Patients,
            c.AddedAt.ToString("yyyy-MM-dd"),
            c.Status.ToString().ToLower()
        )).ToList();
    }
}


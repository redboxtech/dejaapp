using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Representatives.Queries.GetRepresentatives;

public class GetRepresentativesQueryHandler : IRequestHandler<GetRepresentativesQuery, List<RepresentativeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetRepresentativesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<RepresentativeDto>> Handle(GetRepresentativesQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        var representatives = await _context.Representatives
            .AsNoTracking()
            .Where(r => r.OwnerId == ownerId)
            .ToListAsync(cancellationToken);

        return representatives.Select(r => new RepresentativeDto(
            r.Id,
            r.Name,
            r.Email,
            r.AddedAt.ToString("yyyy-MM-dd"),
            r.Status.ToString().ToLower()
        )).ToList();
    }
}


using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Representatives.Commands.DeleteRepresentative;

public class DeleteRepresentativeCommandHandler : IRequestHandler<DeleteRepresentativeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteRepresentativeCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteRepresentativeCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        var representative = await _context.Representatives
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.OwnerId == ownerId, cancellationToken);

        if (representative == null)
        {
            return false;
        }

        _context.Representatives.Remove(representative);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


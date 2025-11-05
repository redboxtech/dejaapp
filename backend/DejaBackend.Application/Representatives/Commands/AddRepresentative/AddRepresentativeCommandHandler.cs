using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Representatives.Commands.AddRepresentative;

public class AddRepresentativeCommandHandler : IRequestHandler<AddRepresentativeCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddRepresentativeCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddRepresentativeCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        // Try to find user by email to get the name
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        var name = existingUser?.Name ?? "Representante Convidado";

        var representative = new Representative(ownerId, name, request.Email);

        _context.Representatives.Add(representative);
        await _context.SaveChangesAsync(cancellationToken);

        return representative.Id;
    }
}


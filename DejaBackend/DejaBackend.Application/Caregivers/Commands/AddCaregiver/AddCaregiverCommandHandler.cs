using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;

namespace DejaBackend.Application.Caregivers.Commands.AddCaregiver;

public class AddCaregiverCommandHandler : IRequestHandler<AddCaregiverCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddCaregiverCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddCaregiverCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var ownerId = _currentUserService.UserId.Value;

        var caregiver = new Caregiver(
            request.Name,
            request.Email,
            request.Phone,
            request.Patients ?? new List<Guid>(),
            ownerId
        );

        _context.Caregivers.Add(caregiver);
        await _context.SaveChangesAsync(cancellationToken);

        return caregiver.Id;
    }
}


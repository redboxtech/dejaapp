using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;

namespace DejaBackend.Application.Patients.Commands.AddPatient;

public class AddPatientCommandHandler : IRequestHandler<AddPatientCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddPatientCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddPatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var entity = new Patient(
            request.Name,
            request.BirthDate,
            request.CareType,
            request.Observations,
            _currentUserService.UserId.Value
        );

        _context.Patients.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

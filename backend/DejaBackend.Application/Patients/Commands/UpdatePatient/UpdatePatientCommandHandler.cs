using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Patients.Commands.UpdatePatient;

public class UpdatePatientCommandHandler : IRequestHandler<UpdatePatientCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdatePatientCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdatePatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var entity = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return false;
        }

        // Only the owner can update the patient details
        if (entity.OwnerId != _currentUserService.UserId.Value)
        {
            throw new UnauthorizedAccessException("Only the owner can update this patient.");
        }

        entity.UpdateDetails(
            request.Name,
            request.BirthDate,
            request.CareType,
            request.Observations
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

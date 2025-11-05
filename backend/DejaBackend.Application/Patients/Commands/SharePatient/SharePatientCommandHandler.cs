using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Patients.Commands.SharePatient;

public class SharePatientCommandHandler : IRequestHandler<SharePatientCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public SharePatientCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IUserRepository userRepository)
    {
        _context = context;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(SharePatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUserId = _currentUserService.UserId.Value;

        // 1. Find the patient
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);

        if (patient == null)
        {
            return false; // Patient not found
        }

        // 2. Check if current user is the owner
        if (patient.OwnerId != currentUserId)
        {
            throw new UnauthorizedAccessException("Only the owner can share this patient.");
        }

        // 3. Find the target representative by email
        var targetUser = await _userRepository.GetUserByEmailAsync(request.RepresentativeEmail);

        if (targetUser == null)
        {
            // Frontend expects a specific error message for this case
            throw new Exception("Representative not found");
        }

        if (targetUser.Id == currentUserId)
        {
            throw new Exception("You cannot share with yourself");
        }

        // 4. Share the patient
        patient.ShareWith(targetUser.Id);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

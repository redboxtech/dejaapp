using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Auth.Commands.UpdateProfile
{
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public UpdateProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return false;
            }

            var userId = _currentUserService.UserId.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null) return false;

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.UpdateName(request.Name);
            }
            // PhoneNumber é do Identity
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}



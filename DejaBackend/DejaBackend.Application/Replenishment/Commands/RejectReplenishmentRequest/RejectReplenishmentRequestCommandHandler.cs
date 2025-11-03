using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Replenishment.Commands.RejectReplenishmentRequest;

public class RejectReplenishmentRequestCommandHandler : IRequestHandler<RejectReplenishmentRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectReplenishmentRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RejectReplenishmentRequestCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        var replenishmentRequest = await _context.ReplenishmentRequests
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

        if (replenishmentRequest == null)
        {
            return false;
        }

        // Only the owner of the medication can reject the request
        if (replenishmentRequest.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Only the medication owner can reject this request.");
        }

        if (replenishmentRequest.Status != RequestStatus.Pending)
        {
            throw new Exception("Request is not pending.");
        }

        // Update request status
        replenishmentRequest.Reject();

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

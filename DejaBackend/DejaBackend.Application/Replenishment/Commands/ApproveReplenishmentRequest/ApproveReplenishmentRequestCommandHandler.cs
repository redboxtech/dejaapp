using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Replenishment.Commands.ApproveReplenishmentRequest;

public class ApproveReplenishmentRequestCommandHandler : IRequestHandler<ApproveReplenishmentRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveReplenishmentRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ApproveReplenishmentRequestCommand request, CancellationToken cancellationToken)
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

        // Only the owner of the medication can approve the request
        if (replenishmentRequest.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Only the medication owner can approve this request.");
        }

        if (replenishmentRequest.Status != RequestStatus.Pending)
        {
            throw new Exception("Request is not pending.");
        }

        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == replenishmentRequest.MedicationId, cancellationToken);

        if (medication == null)
        {
            throw new Exception("Medication associated with request not found.");
        }

        // 1. Update stock and add movement
        medication.UpdateStock(request.QuantityAdded, StockMovementType.In, $"Replenishment Approved - Req #{request.RequestId}", userId);

        // 2. Update request status
        replenishmentRequest.Approve(request.QuantityAdded);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class ReplenishmentRequest
{
    public Guid Id { get; private set; }
    public Guid MedicationId { get; private set; }
    public Guid RequestedBy { get; private set; }
    public DateTime RequestDate { get; private set; }
    public decimal RequestedQuantity { get; private set; }
    public Urgency Urgency { get; private set; }
    public RequestStatus Status { get; private set; }
    public string Notes { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public decimal? AddedQuantity { get; private set; }
    public Guid OwnerId { get; private set; }

    // EF Core constructor
    private ReplenishmentRequest() { }

    public ReplenishmentRequest(
        Guid medicationId, Guid requestedBy, decimal requestedQuantity, Urgency urgency, string notes, Guid ownerId)
    {
        Id = Guid.NewGuid();
        MedicationId = medicationId;
        RequestedBy = requestedBy;
        RequestDate = DateTime.UtcNow;
        RequestedQuantity = requestedQuantity;
        Urgency = urgency;
        Status = RequestStatus.Pending;
        Notes = notes;
        OwnerId = ownerId;
    }

    public void Approve(decimal addedQuantity)
    {
        Status = RequestStatus.Completed;
        CompletedDate = DateTime.UtcNow;
        AddedQuantity = addedQuantity;
    }

    public void Reject()
    {
        Status = RequestStatus.Rejected;
        CompletedDate = DateTime.UtcNow;
    }
}

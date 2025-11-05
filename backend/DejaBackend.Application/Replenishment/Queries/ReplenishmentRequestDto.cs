using DejaBackend.Domain.Enums;

namespace DejaBackend.Application.Replenishment.Queries;

public record ReplenishmentRequestDto(
    Guid Id,
    Guid MedicationId,
    string MedicationName,
    string PatientName,
    Guid RequestedBy,
    string RequestedByName,
    DateTime RequestDate,
    decimal RequestedQuantity,
    Urgency Urgency,
    RequestStatus Status,
    string Notes,
    DateTime? CompletedDate,
    decimal? AddedQuantity,
    Guid OwnerId
);

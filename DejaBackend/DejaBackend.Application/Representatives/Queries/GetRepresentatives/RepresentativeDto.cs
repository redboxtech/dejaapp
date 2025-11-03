namespace DejaBackend.Application.Representatives.Queries.GetRepresentatives;

public record RepresentativeDto(
    Guid Id,
    string Name,
    string Email,
    string AddedAt,
    string Status
);


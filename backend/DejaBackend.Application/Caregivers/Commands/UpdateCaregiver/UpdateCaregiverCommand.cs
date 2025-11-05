using MediatR;

namespace DejaBackend.Application.Caregivers.Commands.UpdateCaregiver;

public record UpdateCaregiverCommand(
    Guid Id,
    string Name,
    string? Email,
    string Phone,
    List<Guid>? Patients
) : IRequest<bool>;


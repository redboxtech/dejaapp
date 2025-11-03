using MediatR;

namespace DejaBackend.Application.Caregivers.Commands.AddCaregiver;

public record AddCaregiverCommand(
    string Name,
    string? Email,
    string Phone,
    List<Guid> Patients
) : IRequest<Guid>;


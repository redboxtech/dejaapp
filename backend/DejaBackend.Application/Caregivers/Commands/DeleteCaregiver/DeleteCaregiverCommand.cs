using MediatR;

namespace DejaBackend.Application.Caregivers.Commands.DeleteCaregiver;

public record DeleteCaregiverCommand(Guid Id) : IRequest<bool>;


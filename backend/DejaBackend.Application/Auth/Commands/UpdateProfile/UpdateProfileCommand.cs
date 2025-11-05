using MediatR;

namespace DejaBackend.Application.Auth.Commands.UpdateProfile
{
    public record UpdateProfileCommand(string Name, string? PhoneNumber) : IRequest<bool>;
}

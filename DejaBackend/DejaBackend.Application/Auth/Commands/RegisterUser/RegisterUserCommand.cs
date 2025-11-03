using MediatR;

namespace DejaBackend.Application.Auth.Commands.RegisterUser;

public record RegisterUserCommand : IRequest<RegisterUserResponse>
{
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public bool IsSelfElderly { get; init; }
}

public record RegisterUserResponse(bool Success, string? Token, string? ErrorMessage);

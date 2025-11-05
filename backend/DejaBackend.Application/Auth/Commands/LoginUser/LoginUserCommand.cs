using MediatR;

namespace DejaBackend.Application.Auth.Commands.LoginUser;

public record LoginUserCommand : IRequest<LoginUserResponse>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}

public record LoginUserResponse(bool Success, string? Token, string? ErrorMessage);

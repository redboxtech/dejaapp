using MediatR;

namespace DejaBackend.Application.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<CurrentUserDto?>;


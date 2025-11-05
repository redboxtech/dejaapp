using MediatR;

namespace DejaBackend.Application.Representatives.Commands.AddRepresentative;

public record AddRepresentativeCommand(string Email) : IRequest<Guid>;


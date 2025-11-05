using MediatR;

namespace DejaBackend.Application.Representatives.Commands.DeleteRepresentative;

public record DeleteRepresentativeCommand(Guid Id) : IRequest<bool>;


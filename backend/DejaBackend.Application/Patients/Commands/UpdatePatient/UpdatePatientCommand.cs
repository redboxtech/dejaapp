using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Patients.Commands.UpdatePatient;

public record UpdatePatientCommand : IRequest<bool>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateOnly BirthDate { get; init; }
    public CareType CareType { get; init; }
    public string Observations { get; init; } = string.Empty;
}

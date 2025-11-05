using MediatR;

namespace DejaBackend.Application.Patients.Commands.SharePatient;

public record SharePatientCommand : IRequest<bool>
{
    public Guid PatientId { get; init; }
    public string RepresentativeEmail { get; init; } = string.Empty;
}

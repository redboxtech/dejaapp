using MediatR;

namespace DejaBackend.Application.Patients.Commands.DeletePatient;

public record DeletePatientCommand(Guid Id) : IRequest<bool>;

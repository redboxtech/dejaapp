using MediatR;

namespace DejaBackend.Application.Prescriptions.Commands.DeletePrescription;

public record DeletePrescriptionCommand(Guid Id) : IRequest<bool>;


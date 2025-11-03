using MediatR;

namespace DejaBackend.Application.Medications.Commands.DeleteMedication;

public record DeleteMedicationCommand(Guid Id) : IRequest<bool>;

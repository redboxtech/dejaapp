using MediatR;

namespace DejaBackend.Application.Medications.Queries.GetMedications;

public record GetMedicationsQuery : IRequest<List<MedicationDto>>;

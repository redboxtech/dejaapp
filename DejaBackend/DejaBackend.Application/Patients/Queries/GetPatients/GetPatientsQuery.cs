using MediatR;

namespace DejaBackend.Application.Patients.Queries.GetPatients;

public record GetPatientsQuery : IRequest<List<PatientDto>>;

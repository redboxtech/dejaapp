using DejaBackend.Application.Prescriptions.Queries;
using MediatR;

namespace DejaBackend.Application.Prescriptions.Queries.GetPrescriptions;

public record GetPrescriptionsQuery : IRequest<List<PrescriptionDto>>;


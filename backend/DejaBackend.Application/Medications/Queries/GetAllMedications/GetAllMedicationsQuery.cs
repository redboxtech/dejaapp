using MediatR;

namespace DejaBackend.Application.Medications.Queries.GetAllMedications;

/// <summary>
/// Query para obter todas as medicações do usuário (incluindo as não associadas a pacientes)
/// Útil para seleção de medicações ao associar a um paciente
/// </summary>
public record GetAllMedicationsQuery : IRequest<List<Queries.MedicationDto>>;


using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.AddMedicationToPatient;

public class AddMedicationToPatientCommandHandler : IRequestHandler<AddMedicationToPatientCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddMedicationToPatientCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddMedicationToPatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Verificar se a medicação existe e o usuário tem acesso
        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.Id == request.MedicationId, cancellationToken);

        if (medication == null)
        {
            throw new Exception("Medication not found.");
        }

        if (medication.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("User does not have access to this medication.");
        }

        // 2. Verificar se o paciente existe e o usuário tem acesso
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);

        if (patient == null)
        {
            throw new Exception("Patient not found.");
        }

        if (patient.OwnerId != userId && !patient.SharedWith.Contains(userId))
        {
            throw new UnauthorizedAccessException("User does not have access to this patient.");
        }

        // 3. Verificar se a medicação já está associada ao paciente
        var existingAssociation = await _context.MedicationPatients
            .FirstOrDefaultAsync(mp => mp.MedicationId == request.MedicationId && mp.PatientId == request.PatientId, cancellationToken);

        if (existingAssociation != null)
        {
            throw new Exception("Medication is already associated with this patient.");
        }

        // 4. Verificar receita se fornecida
        if (request.PrescriptionId.HasValue)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == request.PrescriptionId.Value, cancellationToken);
            
            if (prescription == null)
            {
                throw new Exception("Prescription not found.");
            }
            
            if (prescription.PatientId != request.PatientId)
            {
                throw new Exception("Prescription does not belong to this patient.");
            }
            
            if (prescription.OwnerId != userId && patient.OwnerId != userId && !patient.SharedWith.Contains(userId))
            {
                throw new UnauthorizedAccessException("User does not have access to this prescription.");
            }
        }

        // 5. Adicionar paciente à medicação com posologia
        medication.AddPatient(
            request.PatientId,
            request.Frequency,
            request.Times,
            request.IsHalfDose,
            request.CustomFrequency,
            request.IsExtra,
            request.TreatmentType,
            request.TreatmentStartDate,
            request.TreatmentEndDate,
            request.HasTapering,
            request.DailyConsumption,
            request.PrescriptionId
        );

        await _context.SaveChangesAsync(cancellationToken);

        return request.MedicationId;
    }
}


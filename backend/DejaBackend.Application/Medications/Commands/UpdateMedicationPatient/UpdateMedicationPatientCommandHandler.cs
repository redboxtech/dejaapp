using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.UpdateMedicationPatient;

public class UpdateMedicationPatientCommandHandler : IRequestHandler<UpdateMedicationPatientCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateMedicationPatientCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateMedicationPatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Buscar a associação MedicationPatient
        var medicationPatient = await _context.MedicationPatients
            .Include(mp => mp.Medication)
            .Include(mp => mp.Patient)
            .FirstOrDefaultAsync(
                mp => mp.MedicationId == request.MedicationId && mp.PatientId == request.PatientId,
                cancellationToken);

        if (medicationPatient == null)
        {
            return false;
        }

        // Verificar se o usuário tem acesso ao medicamento e ao paciente
        if (medicationPatient.Medication.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Only the owner can update this medication.");
        }

        var patient = medicationPatient.Patient;
        if (patient.OwnerId != userId && (patient.SharedWith == null || !patient.SharedWith.Contains(userId)))
        {
            throw new UnauthorizedAccessException("User does not have access to this patient.");
        }

        // Verificar se a receita existe e pertence ao usuário (se fornecido)
        Guid? prescriptionId = request.PrescriptionId;
        if (prescriptionId.HasValue)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == prescriptionId.Value && p.OwnerId == userId, cancellationToken);
            
            if (prescription == null)
            {
                prescriptionId = null; // Se não encontrada ou não pertence ao usuário, não atualizar
            }
        }

        // Atualizar a posologia (incluindo PrescriptionId)
        medicationPatient.UpdatePosology(
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
            prescriptionId
        );

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


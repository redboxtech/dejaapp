using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Medications.Commands.RemoveMedicationFromPatient;

public class RemoveMedicationFromPatientCommandHandler : IRequestHandler<RemoveMedicationFromPatientCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RemoveMedicationFromPatientCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RemoveMedicationFromPatientCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Verificar se a medicação existe e o usuário tem acesso
        var medication = await _context.Medications
            .Include(m => m.MedicationPatients)
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

        // 3. Remover a associação
        medication.RemovePatient(request.PatientId);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


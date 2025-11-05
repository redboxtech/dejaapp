using DejaBackend.Application.Interfaces;
using DejaBackend.Application.Medications.Commands.AddMedication;
using DejaBackend.Application.Medications.Commands.AddMedicationToPatient;
using DejaBackend.Domain.Entities;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Prescriptions.Commands.ProcessPrescription;

public class ProcessPrescriptionCommandHandler : IRequestHandler<ProcessPrescriptionCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediator _mediator;

    public ProcessPrescriptionCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        IMediator mediator)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mediator = mediator;
    }

    public async Task<Guid> Handle(ProcessPrescriptionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Verificar se a receita existe e o usuário tem acesso
        var prescription = await _context.Prescriptions
            .Include(p => p.Patient)
            .FirstOrDefaultAsync(p => p.Id == request.PrescriptionId, cancellationToken);

        if (prescription == null)
        {
            throw new Exception("Prescription not found.");
        }

        // Verificar acesso ao paciente
        if (prescription.Patient.OwnerId != userId && !prescription.Patient.SharedWith.Contains(userId))
        {
            throw new UnauthorizedAccessException("User does not have access to this prescription.");
        }

        // 2. Associar medicações existentes à receita
        if (request.ExistingMedicationIds != null && request.ExistingMedicationIds.Any())
        {
            foreach (var medicationId in request.ExistingMedicationIds)
            {
                var existingMedication = await _context.Medications
                    .Include(m => m.MedicationPatients)
                    .FirstOrDefaultAsync(m => m.Id == medicationId, cancellationToken);

                if (existingMedication == null)
                {
                    continue; // Medicação não encontrada, pular
                }

                // Verificar se a medicação tem o paciente da receita associado
                var hasPatient = existingMedication.MedicationPatients.Any(mp => mp.PatientId == prescription.PatientId);
                if (!hasPatient)
                {
                    continue; // Medicação não tem o paciente da receita associado, pular
                }

                // Verificar se o usuário tem acesso à medicação
                if (existingMedication.OwnerId != userId)
                {
                    // Verificar se o usuário tem acesso ao paciente
                    var patient = await _context.Patients
                        .FirstOrDefaultAsync(p => p.Id == prescription.PatientId, cancellationToken);
                    
                    if (patient == null || (patient.OwnerId != userId && !patient.SharedWith.Contains(userId)))
                    {
                        continue; // Usuário não tem acesso, pular
                    }
                }

                // Associar a medicação à receita através do MedicationPatient
                // PrescriptionId agora está em MedicationPatient, não em Medication
                var medicationPatient = existingMedication.MedicationPatients
                    .FirstOrDefault(mp => mp.PatientId == prescription.PatientId);
                if (medicationPatient != null)
                {
                    // Atualizar PrescriptionId no MedicationPatient
                    // Como PrescriptionId é private set, precisamos atualizar através de um método
                    // Por enquanto, vamos apenas continuar - a associação será feita quando criar a nova medicação
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        // 3. Criar novas medicações a partir da receita
        foreach (var medData in request.Medications)
        {
            // Verificar se já existe uma medicação com o mesmo nome que tenha o paciente associado
            var existingMedication = await _context.Medications
                .Include(m => m.MedicationPatients)
                .FirstOrDefaultAsync(m => 
                    m.MedicationPatients.Any(mp => mp.PatientId == prescription.PatientId) && 
                    m.Name.ToLower() == medData.Name.ToLower() &&
                    m.OwnerId == userId, 
                    cancellationToken);

            if (existingMedication != null)
            {
                // Se já existe, pular esta medicação (ou podemos atualizar - por enquanto vamos pular)
                continue;
            }

            // Parse das datas
            if (!DateOnly.TryParse(medData.TreatmentStartDate, out var startDate))
            {
                startDate = DateOnly.FromDateTime(DateTime.Today);
            }

            DateOnly? endDate = null;
            if (!string.IsNullOrWhiteSpace(medData.TreatmentEndDate) && 
                DateOnly.TryParse(medData.TreatmentEndDate, out var parsedEndDate))
            {
                endDate = parsedEndDate;
            }

            // 1. Criar a medicação (apenas informações da medicação, sem posologia)
            var addMedicationCommand = new AddMedicationCommand
            {
                Name = medData.Name,
                Dosage = medData.Dosage,
                DosageUnit = medData.DosageUnit,
                PresentationForm = medData.PresentationForm,
                Route = medData.Route,
                InitialStock = medData.CurrentStock, // Estoque inicial será registrado como movimentação
                BoxQuantity = medData.BoxQuantity,
                Instructions = medData.Instructions ?? string.Empty
            };

            var medicationId = await _mediator.Send(addMedicationCommand, cancellationToken);

            // 2. Associar a medicação ao paciente com posologia usando AddMedicationToPatientCommand
            var addMedicationToPatientCommand = new AddMedicationToPatientCommand
            {
                MedicationId = medicationId,
                PatientId = prescription.PatientId,
                Frequency = medData.Frequency,
                Times = medData.Times,
                IsHalfDose = medData.IsHalfDose,
                CustomFrequency = medData.CustomFrequency,
                IsExtra = medData.IsExtra,
                TreatmentType = (TreatmentType)medData.TreatmentType,
                TreatmentStartDate = startDate,
                TreatmentEndDate = endDate,
                HasTapering = medData.HasTapering,
                DailyConsumption = medData.DailyConsumption,
                PrescriptionId = prescription.Id // Associar à receita
            };

            await _mediator.Send(addMedicationToPatientCommand, cancellationToken);
        }

        return prescription.Id;
    }
}


using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Prescriptions.Commands.UploadPrescription;

public class UploadPrescriptionCommandHandler : IRequestHandler<UploadPrescriptionCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public UploadPrescriptionCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<Guid> Handle(UploadPrescriptionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Verificar se o paciente existe e o usuário tem acesso
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

        // Verificar se já existe uma receita similar (mesmo paciente, mesmo arquivo, mesma data)
        // Se existir, vamos substituir ao invés de bloquear
        var existingPrescription = await _context.Prescriptions
            .FirstOrDefaultAsync(p => 
                p.PatientId == request.PatientId && 
                p.FileName == request.FileName && 
                p.IssueDate == request.IssueDate &&
                p.OwnerId == userId, 
                cancellationToken);

        if (existingPrescription != null)
        {
            // Deletar o arquivo antigo do Azure Storage antes de substituir
            if (!string.IsNullOrWhiteSpace(existingPrescription.FilePath))
            {
                try
                {
                    await _fileStorageService.DeleteFileAsync(existingPrescription.FilePath, "dejacontainer");
                }
                catch
                {
                    // Log do erro mas continua com a substituição
                    // O arquivo antigo pode não existir mais ou ter sido deletado
                }
            }

            // Atualizar a receita existente com os novos dados
            existingPrescription.Update(
                request.FileName,
                request.FilePath,
                request.FileType,
                request.Type,
                request.IssueDate,
                request.DoctorName,
                request.DoctorCrm,
                request.Notes
            );

            await _context.SaveChangesAsync(cancellationToken);
            return existingPrescription.Id;
        }

        // Criar nova receita se não existir duplicata
        var prescription = new Prescription(
            request.FileName,
            request.FilePath,
            request.FileType,
            request.Type,
            request.IssueDate,
            request.PatientId,
            userId,
            request.DoctorName,
            request.DoctorCrm,
            request.Notes
        );

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync(cancellationToken);

        return prescription.Id;
    }
}


using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Prescriptions.Commands.DeletePrescription;

public class DeletePrescriptionCommandHandler : IRequestHandler<DeletePrescriptionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public DeletePrescriptionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<bool> Handle(DeletePrescriptionCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // Buscar a receita com o paciente associado
        // As medicações são associadas através de MedicationPatient, não diretamente
        var prescription = await _context.Prescriptions
            .Include(p => p.Patient)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (prescription == null)
        {
            return false;
        }

        // Verificar acesso: apenas o dono da receita ou quem tem acesso ao paciente pode deletar
        if (prescription.OwnerId != userId && prescription.Patient.OwnerId != userId && !prescription.Patient.SharedWith.Contains(userId))
        {
            throw new UnauthorizedAccessException("User does not have access to delete this prescription.");
        }

        // Remover associação com medicações (define PrescriptionId como null em MedicationPatient)
        // As medicações continuam existindo, apenas sem associação com a receita
        // PrescriptionId agora está em MedicationPatient, não em Medication
        await _context.MedicationPatients
            .Where(mp => mp.PrescriptionId == prescription.Id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(mp => mp.PrescriptionId, (Guid?)null), cancellationToken);

        // Deletar o arquivo do Azure Storage
        if (!string.IsNullOrWhiteSpace(prescription.FilePath))
        {
            try
            {
                await _fileStorageService.DeleteFileAsync(prescription.FilePath, "dejacontainer");
            }
            catch
            {
                // Continuar mesmo se o arquivo não existir mais no Azure
                // Log do erro mas não bloqueia a exclusão
            }
        }

        // Remover a receita do banco de dados
        _context.Prescriptions.Remove(prescription);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}


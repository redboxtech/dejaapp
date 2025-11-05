using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Prescriptions.Queries.GetPrescriptions;

public class GetPrescriptionsQueryHandler : IRequestHandler<GetPrescriptionsQuery, List<PrescriptionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetPrescriptionsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<PrescriptionDto>> Handle(GetPrescriptionsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var userId = _currentUserService.UserId.Value;

        // 1. Buscar todos os pacientes que o usuário tem acesso (owner ou shared)
        var allPatients = await _context.Patients
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        
        var accessiblePatientIds = allPatients
            .Where(p => p.OwnerId == userId || p.SharedWith.Contains(userId))
            .Select(p => p.Id)
            .ToList();

        // 2. Buscar receitas dos pacientes acessíveis ou do próprio usuário
        var prescriptions = await _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Medications)
            .AsNoTracking()
            .Where(p => p.OwnerId == userId || accessiblePatientIds.Contains(p.PatientId))
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync(cancellationToken);

        return prescriptions.Select(p => new PrescriptionDto(
            p.Id,
            p.FileName,
            p.FilePath,
            p.FileType,
            p.Type.ToString(),
            p.IssueDate,
            p.ExpiryDate,
            p.IsReusable,
            p.IsExpired(),
            p.DoctorName,
            p.DoctorCrm,
            p.Notes,
            p.PatientId,
            p.Patient.Name,
            p.OwnerId,
            p.UploadedAt,
            p.Medications.Count
        )).ToList();
    }
}


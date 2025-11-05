using DejaBackend.Domain.Enums;
using MediatR;

namespace DejaBackend.Application.Prescriptions.Commands.UploadPrescription;

public record UploadPrescriptionCommand : IRequest<Guid>
{
    public Guid PatientId { get; init; }
    public PrescriptionType Type { get; init; }
    public DateOnly IssueDate { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string FilePath { get; init; } = string.Empty;
    public string FileType { get; init; } = string.Empty;
    public string? DoctorName { get; init; }
    public string? DoctorCrm { get; init; }
    public string? Notes { get; init; }
}


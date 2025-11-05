namespace DejaBackend.Application.Prescriptions.Queries;

public record PrescriptionDto(
    Guid Id,
    string FileName,
    string FilePath,
    string FileType,
    string Type, // PrescriptionType como string
    DateOnly IssueDate,
    DateOnly ExpiryDate,
    bool IsReusable,
    bool IsExpired,
    string? DoctorName,
    string? DoctorCrm,
    string? Notes,
    Guid PatientId,
    string PatientName,
    Guid OwnerId,
    DateTime UploadedAt,
    int MedicationsCount
);


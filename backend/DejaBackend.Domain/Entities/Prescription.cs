using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class Prescription
{
    public Guid Id { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty; // Caminho do arquivo (imagem ou PDF)
    public string FileType { get; private set; } = string.Empty; // "image/jpeg", "image/png", "application/pdf"
    public PrescriptionType Type { get; private set; }
    public DateOnly IssueDate { get; private set; } // Data de emissão da receita
    public DateOnly ExpiryDate { get; private set; } // Data de validade calculada baseada no tipo
    public bool IsReusable { get; private set; } // Se a receita pode ser reutilizada
    public string? DoctorName { get; private set; } // Nome do médico (extraído da receita)
    public string? DoctorCrm { get; private set; } // CRM do médico (extraído da receita)
    public string? Notes { get; private set; } // Observações adicionais
    public Guid PatientId { get; private set; }
    public Patient Patient { get; private set; } = null!;
    public Guid OwnerId { get; private set; } // Representante legal que fez upload
    public DateTime UploadedAt { get; private set; }
    // Medications foi removido - agora o relacionamento é através de MedicationPatient

    // EF Core constructor
    private Prescription() { }

    public Prescription(
        string fileName,
        string filePath,
        string fileType,
        PrescriptionType type,
        DateOnly issueDate,
        Guid patientId,
        Guid ownerId,
        string? doctorName = null,
        string? doctorCrm = null,
        string? notes = null)
    {
        Id = Guid.NewGuid();
        FileName = fileName;
        FilePath = filePath;
        FileType = fileType;
        Type = type;
        IssueDate = issueDate;
        PatientId = patientId;
        OwnerId = ownerId;
        DoctorName = doctorName;
        DoctorCrm = doctorCrm;
        Notes = notes;
        UploadedAt = DateTime.UtcNow;

        // Calcular validade baseada no tipo
        ExpiryDate = CalculateExpiryDate(type, issueDate);
        IsReusable = DetermineReusability(type);
    }

    private static DateOnly CalculateExpiryDate(PrescriptionType type, DateOnly issueDate)
    {
        return type switch
        {
            PrescriptionType.Simple => issueDate.AddYears(1), // Receita simples: 1 ano
            PrescriptionType.TypeB => issueDate.AddMonths(3), // Receita tipo B: 3 meses
            PrescriptionType.TypeC1 => issueDate.AddMonths(3), // Receita tipo C1: 3 meses
            PrescriptionType.TypeC2 => issueDate.AddMonths(3), // Receita tipo C2: 3 meses
            _ => issueDate.AddYears(1)
        };
    }

    private static bool DetermineReusability(PrescriptionType type)
    {
        return type switch
        {
            PrescriptionType.Simple => true, // Receita simples pode ser reutilizada
            PrescriptionType.TypeB => false, // Receitas controladas não podem ser reutilizadas
            PrescriptionType.TypeC1 => false,
            PrescriptionType.TypeC2 => false,
            _ => true
        };
    }

    public bool IsExpired()
    {
        return DateOnly.FromDateTime(DateTime.Today) > ExpiryDate;
    }

    public bool CanBeReused()
    {
        return IsReusable && !IsExpired();
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
    }

    /// <summary>
    /// Atualiza os dados da receita, incluindo o arquivo e recalculando a validade
    /// </summary>
    public void Update(
        string fileName,
        string filePath,
        string fileType,
        PrescriptionType type,
        DateOnly issueDate,
        string? doctorName = null,
        string? doctorCrm = null,
        string? notes = null)
    {
        FileName = fileName;
        FilePath = filePath;
        FileType = fileType;
        Type = type;
        IssueDate = issueDate;
        DoctorName = doctorName;
        DoctorCrm = doctorCrm;
        Notes = notes;
        
        // Recalcular validade baseada no novo tipo
        ExpiryDate = CalculateExpiryDate(type, issueDate);
        IsReusable = DetermineReusability(type);
        
        // Atualizar data de upload para refletir a substituição
        UploadedAt = DateTime.UtcNow;
    }
}


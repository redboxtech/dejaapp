namespace DejaBackend.Domain.Entities;

public class CaregiverSchedule
{
    public Guid Id { get; private set; }
    public Guid CaregiverId { get; private set; }
    public List<string> DaysOfWeek { get; private set; } = new(); // Segunda, Terça, Quarta, etc.
    public string StartTime { get; private set; } = string.Empty; // HH:mm format
    public string EndTime { get; private set; } = string.Empty; // HH:mm format
    public Guid OwnerId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public Caregiver? Caregiver { get; private set; }
    public ICollection<CaregiverSchedulePatient> CaregiverSchedulePatients { get; private set; } = new List<CaregiverSchedulePatient>();

    // EF Core constructor
    private CaregiverSchedule() { }

    public CaregiverSchedule(
        Guid caregiverId,
        IEnumerable<Guid> patientIds,
        IEnumerable<string> daysOfWeek,
        string startTime,
        string endTime,
        Guid ownerId)
    {
        if (string.IsNullOrWhiteSpace(startTime))
        {
            throw new ArgumentException("Start time is required.", nameof(startTime));
        }

        if (string.IsNullOrWhiteSpace(endTime))
        {
            throw new ArgumentException("End time is required.", nameof(endTime));
        }

        if (daysOfWeek == null || !daysOfWeek.Any())
        {
            throw new ArgumentException("At least one day of the week is required.", nameof(daysOfWeek));
        }

        if (patientIds == null || !patientIds.Any())
        {
            throw new ArgumentException("At least one patient is required.", nameof(patientIds));
        }

        Id = Guid.NewGuid();
        CaregiverId = caregiverId;
        DaysOfWeek = daysOfWeek.ToList();
        StartTime = startTime;
        EndTime = endTime;
        OwnerId = ownerId;
        CreatedAt = DateTime.UtcNow;

        // Adicionar pacientes à escala
        foreach (var patientId in patientIds)
        {
            CaregiverSchedulePatients.Add(new CaregiverSchedulePatient(Id, patientId));
        }
    }

    public void AddPatient(Guid patientId)
    {
        if (!CaregiverSchedulePatients.Any(csp => csp.PatientId == patientId))
        {
            CaregiverSchedulePatients.Add(new CaregiverSchedulePatient(Id, patientId));
        }
    }

    public void RemovePatient(Guid patientId)
    {
        var toRemove = CaregiverSchedulePatients.FirstOrDefault(csp => csp.PatientId == patientId);
        if (toRemove != null)
        {
            CaregiverSchedulePatients.Remove(toRemove);
        }
    }

    public void ClearPatients()
    {
        CaregiverSchedulePatients.Clear();
    }

    public void Update(
        Guid caregiverId,
        IEnumerable<Guid> patientIds,
        IEnumerable<string> daysOfWeek,
        string startTime,
        string endTime)
    {
        if (string.IsNullOrWhiteSpace(startTime))
        {
            throw new ArgumentException("Start time is required.", nameof(startTime));
        }

        if (string.IsNullOrWhiteSpace(endTime))
        {
            throw new ArgumentException("End time is required.", nameof(endTime));
        }

        if (daysOfWeek == null || !daysOfWeek.Any())
        {
            throw new ArgumentException("At least one day of the week is required.", nameof(daysOfWeek));
        }

        if (patientIds == null || !patientIds.Any())
        {
            throw new ArgumentException("At least one patient is required.", nameof(patientIds));
        }

        CaregiverId = caregiverId;
        DaysOfWeek = daysOfWeek.ToList();
        StartTime = startTime;
        EndTime = endTime;

        // Atualizar pacientes
        ClearPatients();
        foreach (var patientId in patientIds)
        {
            AddPatient(patientId);
        }
    }
}


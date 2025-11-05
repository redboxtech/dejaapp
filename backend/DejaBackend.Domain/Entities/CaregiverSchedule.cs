namespace DejaBackend.Domain.Entities;

public class CaregiverSchedule
{
    public Guid Id { get; private set; }
    public Guid CaregiverId { get; private set; }
    public Guid PatientId { get; private set; }
    public List<string> DaysOfWeek { get; private set; } = new(); // Segunda, Terça, Quarta, etc.
    public string StartTime { get; private set; } = string.Empty; // HH:mm format
    public string EndTime { get; private set; } = string.Empty; // HH:mm format
    public Guid OwnerId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public Caregiver? Caregiver { get; private set; }
    public Patient? Patient { get; private set; }

    // EF Core constructor
    private CaregiverSchedule() { }

    public CaregiverSchedule(
        Guid caregiverId,
        Guid patientId,
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

        Id = Guid.NewGuid();
        CaregiverId = caregiverId;
        PatientId = patientId;
        DaysOfWeek = daysOfWeek.ToList();
        StartTime = startTime;
        EndTime = endTime;
        OwnerId = ownerId;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        Guid caregiverId,
        Guid patientId,
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

        CaregiverId = caregiverId;
        PatientId = patientId;
        DaysOfWeek = daysOfWeek.ToList();
        StartTime = startTime;
        EndTime = endTime;
    }
}


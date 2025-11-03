namespace DejaBackend.Domain.Entities;

public enum CaregiverStatus
{
    Active,
    Inactive
}

public class Caregiver
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public List<Guid> Patients { get; private set; } = new();
    public Guid OwnerId { get; private set; }
    public DateTime AddedAt { get; private set; }
    public CaregiverStatus Status { get; private set; }

    private Caregiver() { }

    public Caregiver(string name, string email, string phone, IEnumerable<Guid> patients, Guid ownerId)
    {
        Id = Guid.NewGuid();
        Name = name;
        Email = email;
        Phone = phone;
        Patients = patients?.ToList() ?? new List<Guid>();
        OwnerId = ownerId;
        AddedAt = DateTime.UtcNow;
        Status = CaregiverStatus.Active;
    }

    public void Update(string name, string email, string phone, IEnumerable<Guid> patients)
    {
        Name = name;
        Email = email;
        Phone = phone;
        Patients = patients?.ToList() ?? new List<Guid>();
    }

    public void Deactivate()
    {
        Status = CaregiverStatus.Inactive;
    }
}



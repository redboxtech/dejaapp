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
    public string? Email { get; private set; }
    public string Phone { get; private set; } = string.Empty;
    public List<Guid> Patients { get; private set; } = new();
    public Guid OwnerId { get; private set; }
    public DateTime AddedAt { get; private set; }
    public CaregiverStatus Status { get; private set; }
    public string? Color { get; private set; }

    private Caregiver() { }

    public Caregiver(string name, string? email, string phone, IEnumerable<Guid> patients, Guid ownerId, string? color = null)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Phone is required.", nameof(phone));
        }

        Id = Guid.NewGuid();
        Name = name;
        Email = email;
        Phone = phone;
        Patients = patients?.ToList() ?? new List<Guid>();
        OwnerId = ownerId;
        AddedAt = DateTime.UtcNow;
        Status = CaregiverStatus.Active;
        Color = string.IsNullOrWhiteSpace(color) ? null : color;
    }

    public void Update(string name, string? email, string phone, IEnumerable<Guid> patients, string? color = null)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Phone is required.", nameof(phone));
        }

        Name = name;
        Email = email;
        Phone = phone;
        Patients = patients?.ToList() ?? new List<Guid>();
        Color = string.IsNullOrWhiteSpace(color) ? Color : color;
    }

    public void Deactivate()
    {
        Status = CaregiverStatus.Inactive;
    }
}



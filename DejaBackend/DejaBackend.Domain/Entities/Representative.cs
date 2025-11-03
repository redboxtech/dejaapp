namespace DejaBackend.Domain.Entities;

public enum RepresentativeStatus
{
    Active,
    Inactive
}

public class Representative
{
    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public DateTime AddedAt { get; private set; }
    public RepresentativeStatus Status { get; private set; }

    private Representative() { }

    public Representative(Guid ownerId, string name, string email)
    {
        Id = Guid.NewGuid();
        OwnerId = ownerId;
        Name = name;
        Email = email;
        AddedAt = DateTime.UtcNow;
        Status = RepresentativeStatus.Active;
    }

    public void Deactivate()
    {
        Status = RepresentativeStatus.Inactive;
    }
}



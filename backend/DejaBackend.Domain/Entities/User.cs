using Microsoft.AspNetCore.Identity;

namespace DejaBackend.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string Name { get; private set; }
    public bool IsSelfElderly { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // EF Core constructor
    public User() { }

    public User(string name, string email, bool isSelfElderly)
    {
        Id = Guid.NewGuid();
        Name = name;
        Email = email;
        UserName = email; // Use email as username for Identity
        IsSelfElderly = isSelfElderly;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name cannot be empty.", nameof(name));
        }
        Name = name;
    }
}

using DejaBackend.Domain.Enums;

namespace DejaBackend.Domain.Entities;

public class Patient
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public DateOnly BirthDate { get; private set; }
    public int Age { get; private set; }
    public CareType CareType { get; private set; }
    public string Observations { get; private set; }
    public Guid OwnerId { get; private set; }
    public List<Guid> SharedWith { get; private set; } = new();
    public ICollection<Medication> Medications { get; private set; } = new List<Medication>();

    // EF Core constructor
    private Patient() { }

    public Patient(string name, DateOnly birthDate, CareType careType, string observations, Guid ownerId)
    {
        Id = Guid.NewGuid();
        Name = name;
        BirthDate = birthDate;
        Age = CalculateAge(birthDate);
        CareType = careType;
        Observations = observations;
        OwnerId = ownerId;
    }

    public void UpdateDetails(string name, DateOnly birthDate, CareType careType, string observations)
    {
        Name = name;
        BirthDate = birthDate;
        Age = CalculateAge(birthDate);
        CareType = careType;
        Observations = observations;
    }

    public void ShareWith(Guid userId)
    {
        if (!SharedWith.Contains(userId))
        {
            SharedWith.Add(userId);
        }
    }

    private static int CalculateAge(DateOnly birthDate)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var age = today.Year - birthDate.Year;
        if (birthDate.DayOfYear > today.DayOfYear)
        {
            age--;
        }
        return age;
    }
}

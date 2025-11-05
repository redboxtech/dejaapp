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
    // Relacionamento many-to-many com Medication através de MedicationPatient
    public ICollection<MedicationPatient> MedicationPatients { get; private set; } = new List<MedicationPatient>();
    // Relacionamento many-to-many com CaregiverSchedule através de CaregiverSchedulePatient
    public ICollection<CaregiverSchedulePatient> CaregiverSchedulePatients { get; private set; } = new List<CaregiverSchedulePatient>();
    public DateTime CreatedAt { get; private set; }

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
        CreatedAt = DateTime.UtcNow;
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
namespace DejaBackend.Domain.Entities;

public class CaregiverSchedulePatient
{
    public Guid CaregiverScheduleId { get; private set; }
    public CaregiverSchedule CaregiverSchedule { get; private set; } = null!;
    public Guid PatientId { get; private set; }
    public Patient Patient { get; private set; } = null!;

    private CaregiverSchedulePatient()
    {
    }

    public CaregiverSchedulePatient(Guid caregiverScheduleId, Guid patientId)
    {
        CaregiverScheduleId = caregiverScheduleId;
        PatientId = patientId;
    }
}


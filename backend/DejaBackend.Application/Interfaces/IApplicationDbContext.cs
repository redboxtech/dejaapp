using DejaBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Patient> Patients { get; }
    DbSet<Medication> Medications { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<ReplenishmentRequest> ReplenishmentRequests { get; }
    DbSet<User> Users { get; }
    DbSet<Caregiver> Caregivers { get; }
    DbSet<Representative> Representatives { get; }
    DbSet<Prescription> Prescriptions { get; }
    DbSet<AlertSettings> AlertSettings { get; }
    DbSet<CaregiverSchedule> CaregiverSchedules { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

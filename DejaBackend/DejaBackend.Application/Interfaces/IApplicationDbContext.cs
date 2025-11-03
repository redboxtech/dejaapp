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

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

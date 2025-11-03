using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Medication> Medications { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }
    public DbSet<ReplenishmentRequest> ReplenishmentRequests { get; set; }
    public DbSet<Caregiver> Caregivers { get; set; }
    public DbSet<Representative> Representatives { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User entity as IdentityUser
        builder.Entity<User>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // Configure Patient entity
        builder.Entity<Patient>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.SharedWith)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
                );
        });

        // Configure Medication entity
        builder.Entity<Medication>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Times)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            // Relationship with Patient (bind explicitly to navigation to avoid shadow FK like PatientId1)
            entity.HasOne(m => m.Patient)
                .WithMany(p => p.Medications)
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure StockMovement entity
        builder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(s => s.Id);
            
            // Relationship with Medication
            entity.HasOne<Medication>()
                .WithMany(m => m.Movements)
                .HasForeignKey(s => s.MedicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ReplenishmentRequest entity
        builder.Entity<ReplenishmentRequest>(entity =>
        {
            entity.HasKey(r => r.Id);
            
            // Relationship with Medication
            entity.HasOne<Medication>()
                .WithMany()
                .HasForeignKey(r => r.MedicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Caregiver entity
        builder.Entity<Caregiver>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Patients)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
                );
        });

        // Configure Representative entity
        builder.Entity<Representative>(entity =>
        {
            entity.HasKey(r => r.Id);
        });
    }
}

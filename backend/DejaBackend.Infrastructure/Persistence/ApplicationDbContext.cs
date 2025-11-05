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
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<AlertSettings> AlertSettings { get; set; }
    public DbSet<CaregiverSchedule> CaregiverSchedules { get; set; }

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
            
            // Ignorar propriedades calculadas (não são armazenadas no banco)
            entity.Ignore(m => m.CurrentStock);
            entity.Ignore(m => m.DaysLeft);
            
            // Relationship with Patient (bind explicitly to navigation to avoid shadow FK like PatientId1)
            entity.HasOne(m => m.Patient)
                .WithMany(p => p.Medications)
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Relationship with Prescription (optional)
            entity.HasOne(m => m.Prescription)
                .WithMany(p => p.Medications)
                .HasForeignKey(m => m.PrescriptionId)
                .OnDelete(DeleteBehavior.NoAction); // NoAction para evitar múltiplos caminhos de cascade
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

        // Configure Prescription entity
        builder.Entity<Prescription>(entity =>
        {
            entity.HasKey(p => p.Id);
            
            // Relationship with Patient
            entity.HasOne(p => p.Patient)
                .WithMany()
                .HasForeignKey(p => p.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure AlertSettings entity
        builder.Entity<AlertSettings>(entity =>
        {
            entity.HasKey(a => a.Id);
            
            entity.Property(a => a.MedicationDelayChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            entity.Property(a => a.LowStockChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            entity.Property(a => a.CriticalStockChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            entity.Property(a => a.PrescriptionExpiryChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            entity.Property(a => a.ReplenishmentRequestChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            // Relationship with User (one-to-one)
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Unique constraint: one AlertSettings per User
            entity.HasIndex(a => a.UserId).IsUnique();
        });

        // Configure CaregiverSchedule entity
        builder.Entity<CaregiverSchedule>(entity =>
        {
            entity.HasKey(cs => cs.Id);
            
            entity.Property(cs => cs.DaysOfWeek)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            
            // Relationship with Caregiver
            entity.HasOne(cs => cs.Caregiver)
                .WithMany()
                .HasForeignKey(cs => cs.CaregiverId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Relationship with Patient
            entity.HasOne(cs => cs.Patient)
                .WithMany()
                .HasForeignKey(cs => cs.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

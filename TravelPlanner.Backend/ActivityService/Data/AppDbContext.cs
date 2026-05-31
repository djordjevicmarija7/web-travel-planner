using ActivityService.Models;
using Microsoft.EntityFrameworkCore;

namespace ActivityService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }
        public DbSet<Activity> Activities { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Activity>()
                .Property(a => a.EstimatedCost)
                .HasPrecision(18, 2);
            modelBuilder.Entity<Activity>()
                .HasIndex(a => a.TripId);
            modelBuilder.Entity<Activity>()
                .Property(a => a.Status)
                .HasConversion<int>();
        }

    }
}

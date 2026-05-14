using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Trip> Trips { get; set; }
        public DbSet<Destination> Destinations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Trip>()
                .HasMany(t => t.Destinations)
                .WithOne(d => d.Trip)
                .HasForeignKey(d => d.TripId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Trip>()
                .Property(t => t.Budget)
                .HasPrecision(18, 2);
        }
    }
}

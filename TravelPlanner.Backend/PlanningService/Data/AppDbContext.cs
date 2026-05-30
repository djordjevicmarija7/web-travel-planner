using Microsoft.EntityFrameworkCore;
using PlanningService.Models;

namespace PlanningService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<ChecklistItem>()
                .HasIndex(c => c.TripId);
            modelBuilder.Entity<Expense>()
                .HasIndex(e => e.TripId);
            modelBuilder.Entity<Expense>()
                .Property(e => e.Category)
                .HasConversion<int>();
        }
    }
}

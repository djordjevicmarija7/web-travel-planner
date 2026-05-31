using Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace PlanningService.Models
{
    public class Expense
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; } = ExpenseCategory.other;
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public int TripId { get; set; }
    }
}

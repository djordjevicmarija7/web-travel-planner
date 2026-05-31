using Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs
{
    public class CreateExpenseDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; } = ExpenseCategory.other;
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater then 0.")]
        public decimal Amount { get; set; }
        [Required]
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }
}

using Common.Enums;

namespace Common.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; } = ExpenseCategory.other;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public int TripId { get; set; }
    }
}

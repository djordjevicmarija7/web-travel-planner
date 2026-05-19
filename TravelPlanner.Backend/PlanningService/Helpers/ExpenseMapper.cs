using PlanningService.DTOs;
using PlanningService.Models;

namespace PlanningService.Helpers
{
    public static class ExpenseMapper
    {
        public static ExpenseDto MapToDto(Expense e)
        {
            return new ExpenseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description,
                TripId = e.TripId
            };
        }
    }
}
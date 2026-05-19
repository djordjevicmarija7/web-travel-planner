using PlanningService.DTOs;
using PlanningService.Models;

namespace PlanningService.Helpers
{
    public class ChecklistItemMapper
    {
        public static ChecklistItemDto MapToDto(ChecklistItem c)
        {
            return new ChecklistItemDto
            {
                Id = c.Id,
                Title = c.Title,
                IsCompleted = c.IsCompleted,
                TripId = c.TripId
            };
        }
    }
}

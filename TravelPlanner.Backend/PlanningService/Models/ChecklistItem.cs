using System.ComponentModel.DataAnnotations;

namespace PlanningService.Models
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int TripId { get; set; }

    }
}

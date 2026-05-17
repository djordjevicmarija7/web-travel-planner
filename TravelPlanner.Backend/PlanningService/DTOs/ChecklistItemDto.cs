using System.ComponentModel.DataAnnotations;

namespace PlanningService.DTOs
{
    public class CreateChecklistItemDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

    }
}

using System.ComponentModel.DataAnnotations;

namespace ActivityService.DTOs
{
    public class CreateActivityDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        public string? Time { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public string Status { get; set; } = "planned";
    }
}
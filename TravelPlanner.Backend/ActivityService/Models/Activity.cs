using Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace ActivityService.Models
{
    public class Activity
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public DateTime Date { get; set; }

        public string? Time { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public ActivityStatus Status { get; set; } = ActivityStatus.planned;
        public int TripId { get; set; }
    }
}

using ActivityService.Enums;

namespace ActivityService.DTOs
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? Time { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public ActivityStatus Status { get; set; } = ActivityStatus.planned;
        public int TripId { get; set; }
    }
}

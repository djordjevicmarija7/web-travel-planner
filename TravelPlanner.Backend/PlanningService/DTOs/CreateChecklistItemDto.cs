namespace PlanningService.DTOs
{
    public class ChecklistItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } 
        public int TripId {  get; set; }

    }
}

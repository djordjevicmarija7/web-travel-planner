namespace TravelService.DTOs
{
    public class TripDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal? Budget { get; set; }
        public string? Notes { get; set; }
        public int UserId { get; set; }
        public List<DestinationDto> Destinations { get; set; } = new();
    }
}

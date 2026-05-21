namespace TravelService.DTOs
{
    public class SharedTripDto
    {
        public TripDto Trip { get; set; } = null!;
        public string AccessType { get; set; } = string.Empty;  
    }
}

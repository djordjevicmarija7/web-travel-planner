using TravelService.Enums;

namespace TravelService.DTOs
{
    public class SharedTripDto
    {
        public TripDto Trip { get; set; } = null!;
        public TokenAccessType AccessType { get; set; } = TokenAccessType.view;
    }
}

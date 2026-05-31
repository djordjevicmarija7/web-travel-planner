using System.ComponentModel.DataAnnotations;

namespace TravelService.Models
{
    public class Destination
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
        [Required]
        public DateTime ArrivalDate { get; set; }
        [Required]
        public DateTime DepartureDate { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public int TripId { get; set; }
        public Trip Trip { get; set; } = null!;
    }
}

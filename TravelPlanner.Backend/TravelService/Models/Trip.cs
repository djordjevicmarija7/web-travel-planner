using System.ComponentModel.DataAnnotations;

namespace TravelService.Models
{
    public class Trip
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public decimal? Budget { get; set; }
        public string? Notes { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Destination> Destinations { get; set; } = new();
    }
}

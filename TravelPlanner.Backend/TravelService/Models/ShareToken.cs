using System.ComponentModel.DataAnnotations;
using TravelService.Enums;

namespace TravelService.Models
{
    public class ShareToken
    {
        public int Id { get; set; }
        [Required]
        public string Token { get; set; } = string.Empty;
        public TokenAccessType AccessType { get; set; } = TokenAccessType.view;
        public int TripId { get; set; }
        public Trip Trip { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
        public bool IsActive { get; set; } = true;
    }
}

using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateShareTokenDto
    {
        [Required]
        public string AccessType { get; set; } = "view";
    }
}

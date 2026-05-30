using System.ComponentModel.DataAnnotations;
using TravelService.Enums;

namespace TravelService.DTOs
{
    public class CreateShareTokenDto
    {
        [Required]
        public TokenAccessType AccessType { get; set; } = TokenAccessType.view;
    }
}

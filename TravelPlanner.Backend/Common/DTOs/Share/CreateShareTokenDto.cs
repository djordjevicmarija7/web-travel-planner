using Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs
{
    public class CreateShareTokenDto
    {
        [Required]
        public TokenAccessType AccessType { get; set; } = TokenAccessType.view;
    }
}

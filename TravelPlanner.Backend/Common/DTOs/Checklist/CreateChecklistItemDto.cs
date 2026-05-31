using System.ComponentModel.DataAnnotations;

namespace Common.DTOs
{
    public class CreateChecklistItemDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

    }
}
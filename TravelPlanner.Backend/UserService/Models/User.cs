using System.ComponentModel.DataAnnotations;
using UserService.Enums;

namespace UserService.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.user;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
using UserService.Enums;

namespace UserService.DTOs
{
    public class AuthResponseDto
    {
        public int Id { get; set; }
        public string Name {  get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.user;
        public string Token { get; set; } = string.Empty;
        
    }
}

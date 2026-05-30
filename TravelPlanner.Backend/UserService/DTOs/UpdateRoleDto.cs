using UserService.Enums;

namespace UserService.DTOs
{
    public class UpdateRoleDto
    {
        public UserRole Role { get; set; } = UserRole.user;
    }
}

using Common.Enums;

namespace Common.DTOs
{
    public class UpdateRoleDto
    {
        public UserRole Role { get; set; } = UserRole.user;
    }
}

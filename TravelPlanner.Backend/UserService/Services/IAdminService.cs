using UserService.DTOs;

namespace UserService.Services
{
    public interface IAdminService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> UpdateRoleAsync(int id, UpdateRoleDto dto);
        Task<bool> DeleteUserAsync(int id);
    }
}

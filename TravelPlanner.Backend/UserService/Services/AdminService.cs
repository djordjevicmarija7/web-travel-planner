using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        private readonly IHttpClientFactory _httpClientFactory;

        public AdminService(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            var client = _httpClientFactory.CreateClient();
            await client.DeleteAsync($"http://localhost:5002/api/trips/user/{id}/all");

            return true;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Select(u => MapToDto(u))
                .ToListAsync();
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? null : MapToDto(user);
        }

        public async Task<UserDto?> UpdateRoleAsync(int id, UpdateRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }
            if(dto.Role!=Enums.UserRole.user && dto.Role != Enums.UserRole.admin)
            {
                throw new ArgumentException("Role must be 'user' or 'admin'.");
            }
            user.Role = dto.Role;
            await _context.SaveChangesAsync();
            return MapToDto(user);

        }
        private static UserDto MapToDto(User u)
        {
            return new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            };
        }
    }
}

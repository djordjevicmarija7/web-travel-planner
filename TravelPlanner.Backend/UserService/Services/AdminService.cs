using Common.DTOs;
using Common.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using UserService.Data;
using UserService.Hubs;
using UserService.Models;

namespace UserService.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        private readonly IHubContext<UserHub> _hubContext;

        public AdminService(AppDbContext context, IHttpClientFactory httpClientFactory,
            IConfiguration configuration, IHubContext<UserHub> hubContext)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _hubContext = hubContext;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            var jwt = GenerateInternalToken(id);
            var client = _httpClientFactory.CreateClient();

            var req = new HttpRequestMessage(HttpMethod.Delete, $"http://localhost:5002/api/trips/user/{id}/all");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
            await client.SendAsync(req);
            await _hubContext.Clients.All.SendAsync("UserDeleted", id);
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
            if (dto.Role != UserRole.user && dto.Role != UserRole.admin)
            {
                throw new ArgumentException("Role must be 'user' or 'admin'.");
            }
            user.Role = dto.Role;
            await _context.SaveChangesAsync();
            var result = MapToDto(user);
            await _hubContext.Clients.All.SendAsync("UserRoleUpdated", result);
            return result;
        }

        private string GenerateInternalToken(int userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "service"),
                new Claim("token_type", "internal"),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
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
using AutoMapper;
using Common.DTOs;
using Common.Enums;
using Common.Interfaces;
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
        private readonly IConfiguration _configuration;
        private readonly ITripClient _tripClient;
        private readonly IHubContext<UserHub> _hubContext;
        private readonly IMapper _mapper;

        public AdminService(AppDbContext context, ITripClient tripClient,
            IConfiguration configuration, IHubContext<UserHub> hubContext, IMapper mapper)
        {
            _context = context;
            _tripClient = tripClient;
            _configuration = configuration;
            _hubContext = hubContext;
            _mapper = mapper; 
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            var jwt = GenerateInternalToken(id);
            await _tripClient.DeleteAllByUserAsync(id, jwt);

            await _hubContext.Clients.All.SendAsync("UserDeleted", id);
            return true;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? null : _mapper.Map<UserDto>(user);
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
            var result = _mapper.Map<UserDto>(user);
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
    }
}
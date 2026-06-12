using Common.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using TravelService.Data;
using TravelService.Hubs;
using TravelService.Models;
using AutoMapper;
using Common.Interfaces;

namespace TravelService.Services
{
    public class TripService : ITripService
    {
        private readonly AppDbContext _context;
        private readonly IActivityClient _activityClient;
        private readonly IPlanningClient _planningClient;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<TripHub> _hubContext;
        private readonly IMapper _mapper;

        public TripService(
            AppDbContext context,
            IActivityClient activityClient,
            IPlanningClient planningClient,
            IConfiguration configuration,
            IHubContext<TripHub> hubContext,
            IMapper mapper)
        {
            _context = context;
            _activityClient = activityClient;
            _planningClient = planningClient;
            _configuration = configuration;
            _hubContext = hubContext;
            _mapper = mapper;
        }

        public async Task<TripDto> CreateAsync(CreateTripDto dto, int userId)
        {
            if (dto.EndDate < dto.StartDate)
            {
                throw new ArgumentException("The return date cannot be before the departure date.");
            }
            if (dto.Budget.HasValue && dto.Budget < 0)
            {
                throw new ArgumentException("The budget cannot be negative.");
            }
            var trip = new Trip
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                UserId = userId
            };
            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<TripDto>(trip);
            await _hubContext.Clients.All.SendAsync("TripCreated", result);
            return result;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (trip == null) return false;

            var jwt = GenerateInternalToken(userId);

            await _activityClient.DeleteAllByTripAsync(id, jwt);
            await _planningClient.DeleteAllByTripAsync(id, jwt);

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("TripDeleted", id);
            return true;
        }

        public async Task DeleteAllByUserAsync(int userId)
        {
            var trips = await _context.Trips
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var jwt = GenerateInternalToken(userId);

            foreach (var trip in trips)
            {
                await _activityClient.DeleteAllByTripAsync(trip.Id, jwt);
                await _planningClient.DeleteAllByTripAsync(trip.Id, jwt);
            }

            _context.Trips.RemoveRange(trips);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TripDto>> GetAllAsync(int userId)
        {
            var trips = await _context.Trips
                .Where(t => t.UserId == userId)
                .Include(t => t.Destinations)
                .ToListAsync();

            return _mapper.Map<List<TripDto>>(trips);
        }

        public async Task<TripDto?> GetByIdAsync(int id, int userId)
        {
            var trip = await _context.Trips
                .Include(t => t.Destinations)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            return trip == null ? null : _mapper.Map<TripDto>(trip);
        }

        public async Task<TripDto?> UpdateAsync(int id, UpdateTripDto dto, int userId)
        {
            var trip = await _context.Trips
                .Include(t => t.Destinations)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (trip == null)
                return null;
            if (dto.EndDate < dto.StartDate)
            {
                throw new ArgumentException("The return date cannot be before the departure date.");
            }
            if (dto.Budget.HasValue && dto.Budget < 0)
            {
                throw new ArgumentException("The budget cannot be negative.");
            }

            trip.Name = dto.Name;
            trip.Description = dto.Description;
            trip.StartDate = dto.StartDate;
            trip.EndDate = dto.EndDate;
            trip.Budget = dto.Budget;
            trip.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            var result = _mapper.Map<TripDto>(trip); 
            await _hubContext.Clients.All.SendAsync("TripUpdated", result);
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

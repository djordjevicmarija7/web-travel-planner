using Common.DTOs;
using Common.Enums;
using Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TravelService.Clients;
using TravelService.Data;
using TravelService.Models;

namespace TravelService.Services
{
    public class ShareService : IShareService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IActivityClient _activityClient;
        private readonly IChecklistClient _checklistClient;
        private readonly IExpenseClient _expenseClient;

        public ShareService(AppDbContext context, IActivityClient activityClient,
            IChecklistClient checklistClient, IExpenseClient expenseClient,
            IConfiguration config)
        {
            _context = context;
            _activityClient = activityClient;
            _checklistClient = checklistClient;
            _expenseClient = expenseClient;
            _config = config;
        }
        private string GenerateInternalToken(int tripUserId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, tripUserId.ToString()),
                new Claim(ClaimTypes.Role, "service"),
                new Claim("token_type", "internal"),
            };

            var jwtToken = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(2), 
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }

        public async Task<ShareTokenDto> CreateTokenAsync(int tripId, CreateShareTokenDto dto, int userId)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId);

            if (trip == null)
                throw new InvalidOperationException("Travel plan not found.");

            if (dto.AccessType != TokenAccessType.view && dto.AccessType != TokenAccessType.edit)
                throw new ArgumentException("Access type must be 'view' or 'edit'.");

            var token = new ShareToken
            {
                Token = Guid.NewGuid().ToString("N"),
                AccessType = dto.AccessType,
                TripId = tripId,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsActive = true,
            };

            _context.ShareTokens.Add(token);
            await _context.SaveChangesAsync();
            return MapToDto(token);
        }

        public async Task<SharedTripDto?> GetSharedTripAsync(string token)
        {
            var shareToken = await _context.ShareTokens
                .Include(st => st.Trip)
                    .ThenInclude(t => t.Destinations)
                .FirstOrDefaultAsync(st => st.Token == token);

            if (shareToken == null || !shareToken.IsActive || shareToken.ExpiresAt < DateTime.UtcNow)
                return null;

            var internalJwt = GenerateInternalToken(shareToken.Trip.UserId);

            var activities = await _activityClient.GetByTripIdAsync(shareToken.TripId, internalJwt);
            var checklistItems = await _checklistClient.GetByTripIdAsync(shareToken.TripId, internalJwt);
            var expenses = await _expenseClient.GetByTripIdAsync(shareToken.TripId, internalJwt);

            return new SharedTripDto
            {
                AccessType = shareToken.AccessType,
                Trip = MapTripToDto(shareToken.Trip, activities, checklistItems, expenses),
            };
        }

        public async Task<List<ShareTokenDto>> GetTokensByTripAsync(int tripId, int userId)
        {
            bool tripExists = await _context.Trips
                .AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if (!tripExists)
                return new List<ShareTokenDto>();

            return await _context.ShareTokens
                .Where(st => st.TripId == tripId && st.IsActive)
                .Select(st => MapToDto(st))
                .ToListAsync();
        }

        public async Task<bool> RevokeTokenAsync(int tokenId, int userId)
        {
            var shareToken = await _context.ShareTokens
                .Include(st => st.Trip)
                .FirstOrDefaultAsync(st => st.Id == tokenId);

            if (shareToken == null || shareToken.Trip == null || shareToken.Trip.UserId != userId)
                return false;

            shareToken.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

       
        private static ShareTokenDto MapToDto(ShareToken st) => new ShareTokenDto
        {
            Id = st.Id,
            Token = st.Token,
            AccessType = st.AccessType,
            TripId = st.TripId,
            ExpiresAt = st.ExpiresAt,
            IsActive = st.IsActive,
        };

        private static TripDto MapTripToDto(
            Trip trip,
            List<ActivityDto> activities,
            List<ChecklistItemDto> checklistItems,
            List<ExpenseDto> expenses)
        {
            return new TripDto
            {
                Id = trip.Id,
                Name = trip.Name,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                Budget = trip.Budget,
                Notes = trip.Notes,
                UserId = trip.UserId,

                Destinations = trip.Destinations.Select(d => new DestinationDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Location = d.Location,
                    ArrivalDate = d.ArrivalDate,
                    DepartureDate = d.DepartureDate,
                    Description = d.Description,
                    Notes = d.Notes,
                    TripId = d.TripId,
                }).ToList(),

                Activities = activities.Select(a => new ActivityDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Date = a.Date,
                    Time = a.Time,
                    Location = a.Location,
                    Description = a.Description,
                    EstimatedCost = a.EstimatedCost,
                    Status = a.Status,
                    TripId = a.TripId,
                }).ToList(),

                ChecklistItems = checklistItems.Select(c => new ChecklistItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    IsCompleted = c.IsCompleted,
                    TripId = c.TripId,
                }).ToList(),

                Expenses = expenses.Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Category = e.Category,
                    Amount = e.Amount,
                    Date = e.Date,
                    Description = e.Description,
                    TripId = e.TripId,
                }).ToList(),
            };
        }
    }
}
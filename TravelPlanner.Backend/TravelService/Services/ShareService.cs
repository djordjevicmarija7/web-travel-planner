using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class ShareService : IShareService
    {
        private readonly AppDbContext _context;

        public ShareService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ShareTokenDto> CreateTokenAsync(int tripId, CreateShareTokenDto dto, int userId)
        {
            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId);
            if (trip == null)
            {
                throw new InvalidOperationException("Travel plan not found.");
            }
            if(dto.AccessType!=Enums.TokenAccessType.view && dto.AccessType != Enums.TokenAccessType.edit)
            {
                throw new ArgumentException("Access type must be 'view' or 'edit'.");
            }
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
            if(shareToken == null)
            {
                return null;
            }
            if(!shareToken.IsActive || shareToken.ExpiresAt < DateTime.UtcNow)
            {
                return null;
            }
            return new SharedTripDto
            {
                Trip = MapTripToDto(shareToken.Trip),
                AccessType = shareToken.AccessType
            };
        }

        public async Task<List<ShareTokenDto>> GetTokensByTripAsync(int tripId, int userId)
        {
            bool tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists)
            {
                return new List<ShareTokenDto>();
            }
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
                    if (shareToken == null)
                    {
                        return false;
                    }
            if (shareToken.Trip.UserId != userId)
            {
                return false;
            }
            shareToken.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        private static ShareTokenDto MapToDto(ShareToken st)
        {
            return new ShareTokenDto
            {
                Id = st.Id,
                Token = st.Token,
                AccessType = st.AccessType,
                TripId = st.TripId,
                ExpiresAt = st.ExpiresAt,
                IsActive = st.IsActive
            };
        }
        private static TripDto MapTripToDto(Trip trip)
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
                Destinations = trip.Destinations
                .Select(d => new DestinationDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Location = d.Location,
                    ArrivalDate = d.ArrivalDate,
                    DepartureDate = d.DepartureDate,
                    Description = d.Description,
                    Notes = d.Notes,
                    TripId = d.TripId
                }).ToList()
            };
        }
    }

}

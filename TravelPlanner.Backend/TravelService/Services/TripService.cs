using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class TripService : ITripService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public TripService(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<TripDto> CreateAsync(CreateTripDto dto, int userId)
        {
            if (dto.EndDate < dto.StartDate)
            {
                throw new ArgumentException("The return date cannot be before the departure date.");
            }
            if(dto.Budget.HasValue && dto.Budget < 0)
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
            return MapToDto(trip);
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (trip == null) return false;

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();

            var client = _httpClientFactory.CreateClient();
            await client.DeleteAsync($"http://localhost:5003/api/trips/{id}/all");
            await client.DeleteAsync($"http://localhost:5004/api/trips/{id}/all");

            return true;
        }

        public async Task<List<TripDto>> GetAllAsync(int userId)
        {
            return await _context.Trips
                .Where(t => t.UserId == userId)
                .Include(t => t.Destinations)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        public async Task<TripDto?> GetByIdAsync(int id, int userId)
        {
            var trip = await _context.Trips
                .Include(t => t.Destinations)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            return trip == null ? null : MapToDto(trip);
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
            return MapToDto(trip);
        }

        private static TripDto MapToDto(Trip trip)
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
                    TripId = d.TripId
                }).ToList()
            };
        }
        public async Task DeleteAllByUserAsync(int userId)
        {
            var trips = await _context.Trips
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var client = _httpClientFactory.CreateClient();
            foreach (var trip in trips)
            {
                await client.DeleteAsync($"http://localhost:5003/api/trips/{trip.Id}/all");
                await client.DeleteAsync($"http://localhost:5004/api/trips/{trip.Id}/all");
            }

            _context.Trips.RemoveRange(trips);
            await _context.SaveChangesAsync();
        }
    }
}

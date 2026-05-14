using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly AppDbContext _context;

        public DestinationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DestinationDto> CreateAsync(int tripId, CreateDestinationDto dto, int userId)
        {
            bool tripExists = await _context.Trips
              .AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists)
            {
                throw new InvalidOperationException("Travel plan not found.");
            }
            if (dto.DepartureDate < dto.ArrivalDate)
            {
                throw new ArgumentException("The arrival date cannot be before the departure date.");
            }
            var destination = new Destination
            {
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description,
                Notes = dto.Notes,
                TripId = tripId
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return MapToDto(destination);

        }

        public async Task<bool> DeleteAsync(int id, int tripId, int userId)
        {
            bool tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if(!tripExists)
            {
                return false;
            }
            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TripId == tripId);
            if(destination == null)
            {
                return false;
            }
            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<DestinationDto>> GetAllByTripAsync(int tripId, int userId)
        {
            bool tripExists = await _context.Trips
                .AnyAsync(t=>t.Id==tripId && t.UserId==userId);
            if (!tripExists)
            {
                return new List<DestinationDto>();
            }
            return await _context.Destinations
                .Where(d => d.TripId == tripId)
                .Select(d => MapToDto(d))
                .ToListAsync();
        }

        public async Task<DestinationDto?> GetByIdAsync(int id, int tripId, int userId)
        {
            bool tripExists = await _context.Trips
               .AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists)
            {
                return null;
            }

            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TripId == tripId);
            return destination == null ? null : MapToDto(destination);
        }

        public async Task<DestinationDto?> UpdateAsync(int id, int tripId, UpdateDestinationDto dto, int userId)
        {
            bool tripExists = await _context.Trips
               .AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if (!tripExists) return null;

            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TripId == tripId);

            if (destination == null) return null;

            if (dto.DepartureDate < dto.ArrivalDate)
            {
                throw new ArgumentException("The arrival date cannot be before the departure date.");
            }
            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description;
            destination.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return MapToDto(destination);
        }
        private static DestinationDto MapToDto(Destination d)
        {
            return new DestinationDto
            {
                Id = d.Id,
                Name = d.Name,
                Location = d.Location,
                ArrivalDate = d.ArrivalDate,
                DepartureDate = d.DepartureDate,
                Description = d.Description,
                Notes = d.Notes,
                TripId = d.TripId
            };
        }
    }
}

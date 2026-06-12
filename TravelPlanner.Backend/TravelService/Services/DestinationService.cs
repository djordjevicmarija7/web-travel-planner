using AutoMapper;
using Common.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.Hubs;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationService : IDestinationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<DestinationHub> _hubContext;
        private readonly IMapper _mapper; 

        public DestinationService(AppDbContext context,
            IHubContext<DestinationHub> hubContext,
            IMapper mapper) 
        {
            _context = context;
            _hubContext = hubContext;
            _mapper = mapper; 
        }

        public async Task<DestinationDto> CreateAsync(int tripId, CreateDestinationDto dto, int userId)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId);

            if (trip == null)
            {
                throw new InvalidOperationException("Travel plan not found.");
            }

            if (dto.ArrivalDate > dto.DepartureDate)
            {
                throw new ArgumentException("Departure date must be on or after arrival date.");
            }

            if (dto.ArrivalDate < trip.StartDate || dto.DepartureDate > trip.EndDate)
            {
                throw new ArgumentException("Destination dates must be within the trip dates.");
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

            var result = _mapper.Map<DestinationDto>(destination); 
            await _hubContext.Clients.All.SendAsync("DestinationCreated", result);
            return result;

        }

        public async Task<bool> DeleteAsync(int id, int tripId, int userId)
        {
            bool tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if (!tripExists)
            {
                return false;
            }
            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TripId == tripId);
            if (destination == null)
            {
                return false;
            }
            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("DestinationDeleted", id);
            return true;
        }

        public async Task<List<DestinationDto>> GetAllByTripAsync(int tripId, int userId)
        {
            bool tripExists = await _context.Trips
                .AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists)
            {
                return new List<DestinationDto>();
            }
            var destinations = await _context.Destinations
                .Where(d => d.TripId == tripId)
                .ToListAsync();

            return _mapper.Map<List<DestinationDto>>(destinations);
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
            return destination == null ? null : _mapper.Map<DestinationDto>(destination);
        }

        public async Task<DestinationDto?> UpdateAsync(int id, int tripId, UpdateDestinationDto dto, int userId)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId);

            if (trip == null)
            {
                return null;
            }

            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == id && d.TripId == tripId);

            if (destination == null) return null;

            if (dto.ArrivalDate > dto.DepartureDate)
            {
                throw new ArgumentException("Departure date must be on or after arrival date.");
            }

            if (dto.ArrivalDate < trip.StartDate || dto.DepartureDate > trip.EndDate)
            {
                throw new ArgumentException("Destination dates must be within the trip dates.");
            }
            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description;
            destination.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            var result = _mapper.Map<DestinationDto>(destination); 
            await _hubContext.Clients.All.SendAsync("DestinationUpdated", result);
            return result;
        }
       
    }
}

using ActivityService.Clients;
using ActivityService.Data;
using ActivityService.Hubs;
using ActivityService.Models;
using AutoMapper;
using Common.DTOs;
using Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ActivityService.Services
{
    public class ActivityServiceImplementation : IActivityService
    {

        private readonly AppDbContext _context;
        private readonly ITripClient _tripApiClient;
        private readonly IHubContext<ActivityHub> _hubContext;
        private readonly IMapper _mapper; 

        public ActivityServiceImplementation(AppDbContext context,
            ITripClient tripApiClient,
            IHubContext<ActivityHub> hubContext,
            IMapper mapper) 
        {
            _context = context;
            _tripApiClient = tripApiClient;
            _hubContext = hubContext;
            _mapper = mapper; 
        }

        public async Task<ActivityDto?> CreateAsync(int tripId, CreateActivityDto dto)
            {
                var trip = await _tripApiClient.GetByIdAsync(tripId);
                if (trip == null)
                {
                    throw new InvalidOperationException("Travel plan not found.");
                }

                if (dto.EstimatedCost.HasValue && dto.EstimatedCost < 0)
                {
                    throw new ArgumentException("Expenses cannot be negative.");
                }

                if (dto.Date.Date < trip.StartDate.Date || dto.Date.Date > trip.EndDate.Date)
                {
                    throw new ArgumentException("Activity date must be within the trip dates.");
                }

                var activity = new Activity
                {
                    Name = dto.Name,
                    Date = dto.Date,
                    Time = dto.Time,
                    Location = dto.Location,
                    Description = dto.Description,
                    EstimatedCost = dto.EstimatedCost,
                    Status = dto.Status,
                    TripId = tripId
                };

                _context.Activities.Add(activity);
                await _context.SaveChangesAsync();
            var result = _mapper.Map<ActivityDto>(activity); 
            await _hubContext.Clients.All.SendAsync("ActivityCreated", result);
            return result;
        }

            public async Task<bool> DeleteAsync(int id, int tripId)
        {
            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TripId == tripId);
            if (activity == null)
            {
                return false;
            }
            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ActivityDeleted", id);
            return true;
        }

        public async Task<List<ActivityDto>> GetAllByTripAsync(int tripId)
        {
            var activities = await _context.Activities
                .Where(a => a.TripId == tripId)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .ToListAsync();

            return _mapper.Map<List<ActivityDto>>(activities);
        }

        public async Task<ActivityDto?> GetByIdAsync(int id, int tripId)
        {
            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TripId == tripId);
            return activity == null ? null : _mapper.Map<ActivityDto>(activity);
        }

        public async Task<ActivityDto?> UpdateAsync(int id, int tripId, UpdateActivityDto dto)
        {
            var trip = await _tripApiClient.GetByIdAsync(tripId);
            if (trip == null)
            {
                return null;
            }

            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TripId == tripId);

            if (activity == null)
            {
                return null;
            }

            if (dto.EstimatedCost.HasValue && dto.EstimatedCost < 0)
            {
                throw new ArgumentException("Expenses cannot be negative.");
            }

            if (dto.Date.Date < trip.StartDate.Date || dto.Date.Date > trip.EndDate.Date)
            {
                throw new ArgumentException("Activity date must be within the trip dates.");
            }

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.Status = dto.Status;
            activity.EstimatedCost = dto.EstimatedCost;

            await _context.SaveChangesAsync();

            var result = _mapper.Map<ActivityDto>(activity); 
            await _hubContext.Clients.All.SendAsync("ActivityUpdated", result);
            return result;
        }
        public async Task DeleteAllByTripAsync(int tripId)
        {
            var activities = await _context.Activities
                .Where(a => a.TripId == tripId)
                .ToListAsync();
            _context.Activities.RemoveRange(activities);
            await _context.SaveChangesAsync();
        }
    }
}

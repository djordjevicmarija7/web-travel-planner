using ActivityService.Clients;
using ActivityService.Data;
using ActivityService.Models;
using Common.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ActivityService.Services
{
    public class ActivityServiceImplementation : IActivityService
    {
        private readonly AppDbContext _context;
        private readonly TripApiClient _tripClient;

        public ActivityServiceImplementation(AppDbContext context, TripApiClient tripClient)
        {
            _context = context;
            _tripClient = tripClient;
        }

        public async Task<ActivityDto?> CreateAsync(int tripId, CreateActivityDto dto)
        {
            var trip = await _tripClient.GetTripAsync(tripId);
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
            return MapToDto(activity);
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
            return true;
        }

        public async Task<List<ActivityDto>> GetAllByTripAsync(int tripId)
        {
            return await _context.Activities
                .Where(a => a.TripId == tripId)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => MapToDto(a))
                .ToListAsync();
        }

        public async Task<ActivityDto?> GetByIdAsync(int id, int tripId)
        {
            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TripId == tripId);
            return activity == null ? null : MapToDto(activity);
        }

        public async Task<ActivityDto?> UpdateAsync(int id, int tripId, UpdateActivityDto dto)
        {
            var trip = await _tripClient.GetTripAsync(tripId);
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
            return MapToDto(activity);
        }
        private static ActivityDto MapToDto(Activity activity)
        {
            return new ActivityDto
            {
                Id = activity.Id,
                Name = activity.Name,
                Date = activity.Date,
                Time = activity.Time,
                Location = activity.Location,
                Description = activity.Description,
                EstimatedCost = activity.EstimatedCost,
                Status = activity.Status,
                TripId = activity.TripId
            };
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

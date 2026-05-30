using Microsoft.EntityFrameworkCore;
using ActivityService.Data;
using ActivityService.DTOs;
using ActivityService.Models;

namespace ActivityService.Services
{
    public class ActivityServiceImplementation : IActivityService
    {
        private readonly AppDbContext _context;

        public ActivityServiceImplementation(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActivityDto?> CreateAsync(int tripId, CreateActivityDto dto)
        {
            if(dto.EstimatedCost.HasValue && dto.EstimatedCost < 0)
            {
                throw new ArgumentException("Expencies cannot be negative.");
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
            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == id && a.TripId == tripId);
            if (activity == null)
            {
                return null;
            }
            if (dto.EstimatedCost.HasValue && dto.EstimatedCost < 0)
            {
                throw new ArgumentException("Expencies cannot be negative.");
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

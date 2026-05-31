using Common.DTOs;

namespace ActivityService.Services
{
    public interface IActivityService
    {
        Task<List<ActivityDto>> GetAllByTripAsync(int tripId);
        Task<ActivityDto?> GetByIdAsync(int id, int tripId);
        Task<ActivityDto?> CreateAsync(int tripId, CreateActivityDto dto);
        Task<ActivityDto?> UpdateAsync(int id, int tripId, UpdateActivityDto dto);
        Task<bool> DeleteAsync(int id, int tripId);
        Task DeleteAllByTripAsync(int tripId);
    }
}

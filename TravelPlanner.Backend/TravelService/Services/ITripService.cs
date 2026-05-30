using TravelService.DTOs;

namespace TravelService.Services
{
    public interface ITripService
    {
        Task<List<TripDto>> GetAllAsync(int userId);
        Task<TripDto?> GetByIdAsync(int id, int userId);
        Task<TripDto> CreateAsync(CreateTripDto dto, int userId);
        Task<TripDto?> UpdateAsync(int id, UpdateTripDto dto, int userId);
        Task<bool> DeleteAsync(int id, int userId);
        Task DeleteAllByUserAsync(int userId);
    }
}

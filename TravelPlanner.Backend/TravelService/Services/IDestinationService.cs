using Common.DTOs;

namespace TravelService.Services
{
    public interface IDestinationService
    {
        Task<List<DestinationDto>> GetAllByTripAsync(int tripId, int userId, bool isAdmin = false);
        Task<DestinationDto?> GetByIdAsync(int id, int tripId, int userId, bool isAdmin = false);
        Task<DestinationDto> CreateAsync(int tripId, CreateDestinationDto dto, int userId, bool isAdmin = false);
        Task<DestinationDto?> UpdateAsync(int id, int tripId, UpdateDestinationDto dto, int userId, bool isAdmin = false);
        Task<bool> DeleteAsync(int id, int tripId, int userId, bool isAdmin = false);
    }
}
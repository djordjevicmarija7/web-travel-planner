using TravelService.DTOs;

namespace TravelService.Services
{
    public interface IDestinationService
    {
        Task<List<DestinationDto>> GetAllByTripAsync(int tripId, int userId);
        Task<DestinationDto?> GetByIdAsync(int id, int tripId, int userId);
        Task<DestinationDto> CreateAsync(int tripId, CreateDestinationDto dto, int userId);
        Task<DestinationDto?> UpdateAsync(int id, int tripId,  UpdateDestinationDto dto, int userId);
        Task<bool> DeleteAsync(int id, int tripId, int userId);
    }
}

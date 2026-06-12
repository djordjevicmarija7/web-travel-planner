using Common.DTOs;

namespace Common.Interfaces
{
    public interface IActivityClient
    {
        Task<List<ActivityDto>> GetByTripIdAsync(int tripId, string? bearerToken = null);
        Task DeleteAllByTripAsync(int tripId, string bearerToken);
    }
}
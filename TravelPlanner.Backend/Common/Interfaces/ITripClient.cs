using Common.DTOs;

namespace Common.Interfaces
{
    public interface ITripClient
    {
        Task<TripDto?> GetByIdAsync(int tripId, string? bearerToken = null);
        Task DeleteAllByUserAsync(int userId, string bearerToken);
    }
}
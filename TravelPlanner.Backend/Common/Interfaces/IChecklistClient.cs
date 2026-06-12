using Common.DTOs;

namespace Common.Interfaces
{
    public interface IChecklistClient
    {
        Task<List<ChecklistItemDto>> GetByTripIdAsync(int tripId, string? bearerToken = null);
        Task DeleteAllByTripAsync(int tripId, string bearerToken);
    }
}
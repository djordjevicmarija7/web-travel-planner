using Common.DTOs;

namespace PlanningService.Services
{
    public interface IChecklistService
    {
        Task<List<ChecklistItemDto>> GetAllByTripAsync(int tripId);
        Task<ChecklistItemDto> CreateAsync(int tripId, CreateChecklistItemDto dto);
        Task<ChecklistItemDto?> ToggleAsync(int id, int tripId, ToggleChecklistItemDto dto);
        Task<bool> DeleteAsync(int id, int tripId);
        Task DeleteAllByTripAsync(int tripId);
    }
}

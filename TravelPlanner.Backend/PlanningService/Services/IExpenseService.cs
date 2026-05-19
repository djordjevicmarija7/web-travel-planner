using PlanningService.DTOs;

namespace PlanningService.Services
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetAllByTripAsync(int tripId);
        Task<ExpenseDto> CreateAsync(int tripId, CreateExpenseDto dto);
        Task<bool> DeleteAsync(int id, int tripId);

    }
}

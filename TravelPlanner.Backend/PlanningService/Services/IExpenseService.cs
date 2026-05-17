using PlanningService.DTOs;

namespace PlanningService.Services
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetAllByTripAsync(int triId);
        Task<ExpenseDto> CreateAsync(int triId, CreateExpenseDto dto);
        Task<bool> DeleteAsync(int id, int triId);

    }
}

using Common.DTOs;

namespace Common.Interfaces
{
    public interface IExpenseClient
    {
        Task<List<ExpenseDto>> GetByTripIdAsync(int tripId, string? bearerToken = null);
        Task DeleteAllByTripAsync(int tripId, string bearerToken);
    }
}
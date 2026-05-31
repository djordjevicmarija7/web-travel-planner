using Common.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using PlanningService.Data;
using PlanningService.Helpers;
using PlanningService.Models;

namespace PlanningService.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly AppDbContext _context;
        private readonly IReliableStateManager _stateManager;
        private const string TotalCacheName = "expenseTotals";

        public ExpenseService(AppDbContext context, IReliableStateManager stateManager)
        {
            _context = context;
            _stateManager = stateManager;
        }

        public async Task<ExpenseDto> CreateAsync(int tripId, CreateExpenseDto dto)
        {
            var expense = new Expense
            {
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                TripId = tripId
            };
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            await IncrementTotalAsync(tripId, dto.Amount);
            return ExpenseMapper.MapToDto(expense);
        }

        public async Task<bool> DeleteAsync(int id, int tripId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TripId == tripId);

            if (expense == null)
            {
                return false;
            }
            decimal amount = expense.Amount;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            await DecrementTotalAsync(tripId, amount);

            return true;
        }

        public async Task<List<ExpenseDto>> GetAllByTripAsync(int tripId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TripId == tripId)
                .OrderBy(e => e.Date)
                .ToListAsync();

            decimal total = expenses.Sum(e => e.Amount);
            await UpdateTotalAsync(tripId, total);

            return expenses.Select(ExpenseMapper.MapToDto).ToList();
        }

        private async Task UpdateTotalAsync(int tripId, decimal total)
        {
            var dict = await _stateManager
                .GetOrAddAsync<IReliableDictionary<int, string>>(TotalCacheName);
            using var tx = _stateManager.CreateTransaction();
            await dict.SetAsync(tx, tripId, total.ToString("F2"));
            await tx.CommitAsync();
        }

        private async Task IncrementTotalAsync(int tripId, decimal amount)
        {
            var dict = await _stateManager
                .GetOrAddAsync<IReliableDictionary<int, string>>(TotalCacheName);

            using var tx = _stateManager.CreateTransaction();
            var current = await dict.TryGetValueAsync(tx, tripId);
            decimal currentTotal = current.HasValue
                ? decimal.Parse(current.Value)
                : 0;
            await dict.SetAsync(tx, tripId,
                (currentTotal + amount).ToString("F2"));
            await tx.CommitAsync();
        }

        private async Task DecrementTotalAsync(int tripId, decimal amount)
        {
            var dict = await _stateManager
    .GetOrAddAsync<IReliableDictionary<int, string>>(TotalCacheName);

            using var tx = _stateManager.CreateTransaction();
            var current = await dict.TryGetValueAsync(tx, tripId);
            decimal currentTotal = current.HasValue
                ? decimal.Parse(current.Value)
                : 0;
            decimal newTotal = Math.Max(0, currentTotal - amount);
            await dict.SetAsync(tx, tripId, newTotal.ToString("F2"));
            await tx.CommitAsync();
        }
        public async Task DeleteAllByTripAsync(int tripId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TripId == tripId)
                .ToListAsync();
            _context.Expenses.RemoveRange(expenses);
            await _context.SaveChangesAsync();
        }
    }
}

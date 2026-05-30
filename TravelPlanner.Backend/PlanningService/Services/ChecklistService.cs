using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using PlanningService.Data;
using PlanningService.DTOs;
using PlanningService.Models;
using PlanningService.Helpers;

namespace PlanningService.Services
{
    public class ChecklistService : IChecklistService
    {
        private readonly AppDbContext _context;
        private readonly IReliableStateManager _stateManager;

        private const string DictName = "checklistState";

        public ChecklistService(AppDbContext context, IReliableStateManager stateManager)
        {
            _context = context;
            _stateManager = stateManager;
        }

        public async Task<ChecklistItemDto> CreateAsync(int tripId, CreateChecklistItemDto dto)
        {
            var item = new ChecklistItem
            {
                Title = dto.Title,
                IsCompleted = false,
                TripId = tripId
            };

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();

            var dict = await _stateManager
                .GetOrAddAsync<IReliableDictionary<int, bool>>(
                $"{DictName}_{tripId}");

            using var tx = _stateManager.CreateTransaction();
            await dict.SetAsync(tx, item.Id, false);
            await tx.CommitAsync();

            return ChecklistItemMapper.MapToDto(item);
        }

        public async Task<bool> DeleteAsync(int id, int tripId)
        {
            var item = await _context.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TripId == tripId);
            if (item == null)
            {
                return false;
            }

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();

            var dict = await _stateManager
                .GetOrAddAsync<IReliableDictionary<int, bool>>(
                $"{DictName}_{tripId}");

            using var tx = _stateManager.CreateTransaction();
            await dict.TryRemoveAsync(tx, id);
            await tx.CommitAsync();
            return true;
        }

        public async Task<List<ChecklistItemDto>> GetAllByTripAsync(int tripId)
        {
            var dict = await _stateManager.GetOrAddAsync<IReliableDictionary<int, bool>>(
                $"{DictName}_{tripId}");

            var items = await _context.ChecklistItems
                .Where(c => c.TripId == tripId)
                .ToListAsync();
            using var tx = _stateManager.CreateTransaction();
            foreach(var item in items)
            {
                await dict.SetAsync(tx, item.Id, item.IsCompleted);
            }
            await tx.CommitAsync();
            return items.Select(ChecklistItemMapper.MapToDto).ToList();
        }

        public async Task<ChecklistItemDto?> ToggleAsync(int id, int tripId, ToggleChecklistItemDto dto)
        {
            var item = await _context.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == id && c.TripId == tripId);
            if (item == null)
            {
                return null;
            }
            item.IsCompleted = dto.IsCompleted;
            await _context.SaveChangesAsync();

            var dict = await _stateManager
                .GetOrAddAsync<IReliableDictionary<int, bool>>(
                $"{DictName}_{tripId}");

            using var tx = _stateManager.CreateTransaction();
            await dict.SetAsync(tx, item.Id, dto.IsCompleted);
            await tx.CommitAsync();
            return ChecklistItemMapper.MapToDto(item);
        }
        public async Task DeleteAllByTripAsync(int tripId)
        {
            var items = await _context.ChecklistItems
                .Where(c => c.TripId == tripId)
                .ToListAsync();
            _context.ChecklistItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
    }
}

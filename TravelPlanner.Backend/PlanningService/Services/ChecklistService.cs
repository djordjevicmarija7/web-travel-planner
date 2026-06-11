using AutoMapper;
using Common.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using PlanningService.Data;
using PlanningService.Helpers;
using PlanningService.Hubs;
using PlanningService.Models;

namespace PlanningService.Services
{
    public class ChecklistService : IChecklistService
    {
        private readonly AppDbContext _context;
        private readonly IReliableStateManager _stateManager;
        private readonly IMapper _mapper;
        private const string DictName = "checklistState";

        private readonly IHubContext<PlanningHub> _hubContext;

        public ChecklistService(AppDbContext context, IReliableStateManager stateManager,
            IHubContext<PlanningHub> hubContext, IMapper mapper)
        {
            _context = context;
            _stateManager = stateManager;
            _hubContext = hubContext;
            _mapper = mapper;
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
            var result = _mapper.Map<ChecklistItemDto>(item); 
            await _hubContext.Clients.All.SendAsync("ChecklistItemCreated", result);
            return result;
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
            await _hubContext.Clients.All.SendAsync("ChecklistItemDeleted", id);
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
            foreach (var item in items)
            {
                await dict.SetAsync(tx, item.Id, item.IsCompleted);
            }
            await tx.CommitAsync();
            return _mapper.Map<List<ChecklistItemDto>>(items);
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
            var result = _mapper.Map<ChecklistItemDto>(item); 
            await _hubContext.Clients.All.SendAsync("ChecklistItemToggled", result);
            return result;
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

using Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlanningService.Services;

namespace PlanningService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private readonly IChecklistService _checklistService;

        public ChecklistController(IChecklistService checklistService)
        {
            _checklistService = checklistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            var items = await _checklistService.GetAllByTripAsync(tripId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int tripId,
            [FromBody] CreateChecklistItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var item = await _checklistService.CreateAsync(tripId, dto);
            return Ok(item);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Toggle(int tripId, int id,
            [FromBody] ToggleChecklistItemDto dto)
        {
            var item = await _checklistService.ToggleAsync(id, tripId, dto);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            var deleted = await _checklistService.DeleteAsync(id, tripId);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
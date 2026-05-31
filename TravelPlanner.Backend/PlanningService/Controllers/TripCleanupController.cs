using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlanningService.Services;

namespace PlanningService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}")]
    [Authorize]
    public class TripCleanupController : ControllerBase
    {
        private readonly IChecklistService _checklistService;
        private readonly IExpenseService _expenseService;

        public TripCleanupController(IChecklistService checklistService, IExpenseService expenseService)
        {
            _checklistService = checklistService;
            _expenseService = expenseService;
        }

        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAll(int tripId)
        {
            await _checklistService.DeleteAllByTripAsync(tripId);
            await _expenseService.DeleteAllByTripAsync(tripId);
            return NoContent();
        }
    }
}
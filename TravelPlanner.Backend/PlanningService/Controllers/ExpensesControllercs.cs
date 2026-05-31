using Common.DTOs;
using Microsoft.AspNetCore.Mvc;
using PlanningService.Services;

namespace PlanningService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/expenses")]
    public class ExpensesControllercs : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpensesControllercs(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            var expenses = await _expenseService.GetAllByTripAsync(tripId);
            return Ok(expenses);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int tripId,
            [FromBody] CreateExpenseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var expense = await _expenseService.CreateAsync(tripId, dto);
            return Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            var deleted = await _expenseService.DeleteAsync(id, tripId);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}

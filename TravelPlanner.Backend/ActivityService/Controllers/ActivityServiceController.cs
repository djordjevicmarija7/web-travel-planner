using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ActivityService.DTOs;
using ActivityService.Services;

namespace ActivityService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/activities")]
    [Authorize]
    public class ActivityServiceController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivityServiceController(IActivityService activityService)
        {
            _activityService = activityService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            var activities = await _activityService.GetAllByTripAsync(tripId);
            return Ok(activities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int tripId, int id)
        {
            var activity = await _activityService.GetByIdAsync(id, tripId);
            if(activity == null)
            {
                return NotFound();
            }
            return Ok(activity);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateActivityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var activity = await _activityService.CreateAsync(tripId, dto);
                return CreatedAtAction(nameof(GetById), new { tripId, id = activity.Id }, activity);
            }
            catch(ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateActivityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var activity = await _activityService.UpdateAsync(id, tripId, dto);
                if (activity == null)
                {
                    return NotFound();
                }
                return Ok(activity);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            var deleted = await _activityService.DeleteAsync(id, tripId);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}

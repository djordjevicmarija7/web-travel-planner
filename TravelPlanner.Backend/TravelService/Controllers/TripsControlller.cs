using Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/trips")]
    [Authorize]
    public class TripsControlller : ControllerBase
    {
        private readonly ITripService _tripService;

        public TripsControlller(ITripService tripService)
        {
            _tripService = tripService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var trips = await _tripService.GetAllAsync(GetUserId());
            return Ok(trips);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trip = await _tripService.GetByIdAsync(id, GetUserId());
            if (trip == null)
            {
                return NotFound();
            }
            return Ok(trip);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTripDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var trip = await _tripService.CreateAsync(dto, GetUserId());
                return CreatedAtAction(nameof(GetById), new { id = trip.Id }, trip);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTripDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var trip = await _tripService.UpdateAsync(id, dto, GetUserId());
                if (trip == null)
                {
                    return NotFound();
                }
                return Ok(trip);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _tripService.DeleteAsync(id, GetUserId());
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
        [HttpDelete("user/{userId}/all")]
        [Authorize(Roles = "service,admin")]
        public async Task<IActionResult> DeleteAllByUser(int userId)
        {
            await _tripService.DeleteAllByUserAsync(userId);
            return NoContent();
        }
    }
}

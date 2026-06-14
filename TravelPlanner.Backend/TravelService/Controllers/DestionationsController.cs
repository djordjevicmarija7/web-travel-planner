using Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/destinations")]
    [Authorize]
    public class DestionationsController : ControllerBase
    {
        private readonly IDestinationService _destinationService;

        public DestionationsController(IDestinationService destinationService)
        {
            _destinationService = destinationService;
        }
        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
        private bool IsAdmin()
        {
            return User.FindFirstValue(ClaimTypes.Role) == "admin";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            var destinations = await _destinationService
                .GetAllByTripAsync(tripId, GetUserId(), IsAdmin());
            return Ok(destinations);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int tripId, int id)
        {
            var destination = await _destinationService
                .GetByIdAsync(id, tripId, GetUserId(), IsAdmin());
            if (destination == null)
            {
                return NotFound();
            }
            return Ok(destination);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateDestinationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var destination = await _destinationService.CreateAsync(tripId, dto, GetUserId(), IsAdmin());
                return CreatedAtAction(nameof(GetById), new { tripId, id = destination.Id }, destination);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateDestinationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var destination = await _destinationService.UpdateAsync(id, tripId, dto, GetUserId(), IsAdmin());
                if (destination == null)
                {
                    return NotFound();
                }
                return Ok(destination);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            var deleted = await _destinationService
                .DeleteAsync(id, tripId, GetUserId(), IsAdmin());
            if (!deleted) return NotFound();
            return NoContent();
        }

    }
}
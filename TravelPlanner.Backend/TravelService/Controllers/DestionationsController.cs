using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTOs;
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

        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            var destinations = await _destinationService
                .GetAllByTripAsync(tripId, GetUserId());
            return Ok(destinations);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int tripId, int id)
        {
            var destination = await _destinationService
                .GetByIdAsync(id, tripId, GetUserId());
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
                var destination = await _destinationService.CreateAsync(tripId, dto, GetUserId());
                return CreatedAtAction(nameof(GetById), new { tripId, id = destination.Id }, destination);
            }
            catch(ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch(InvalidOperationException ex)
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
                var destination = await _destinationService.UpdateAsync(id, tripId, dto, GetUserId());
                if(destination == null)
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
                .DeleteAsync(id, tripId, GetUserId());
            if (!deleted) return NotFound();
            return NoContent();
        }

    }
}

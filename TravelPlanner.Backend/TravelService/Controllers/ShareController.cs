using Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/share")]
    public class ShareController : ControllerBase
    {
        private readonly IShareService _shareService;

        public ShareController(IShareService shareService)
        {
            _shareService = shareService;
        }
        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateToken(int tripId, [FromBody] CreateShareTokenDto dto)
        {
            try
            {
                var token = await _shareService.CreateTokenAsync(tripId, dto, GetUserId());
                return Ok(token);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetTokens(int tripId)
        {
            var tokens = await _shareService.GetTokensByTripAsync(tripId, GetUserId());
            return Ok(tokens);
        }

        [HttpDelete("{tokenId}")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(int tripId, int tokenId)
        {
            var revoked = await _shareService.RevokeTokenAsync(tokenId, GetUserId());
            if (!revoked)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}

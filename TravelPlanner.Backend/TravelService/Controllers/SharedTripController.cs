using Microsoft.AspNetCore.Mvc;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/shared")]
    public class SharedTripController : ControllerBase
    {
        private readonly IShareService _shareService;

        public SharedTripController(IShareService shareService)
        {
            _shareService = shareService;
        }

        [HttpGet("{token}")]
        public async Task<IActionResult> GetSHaredTrip(string token)
        {
            var result = await _shareService.GetSharedTripAsync(token);
            if (result == null)
            {
                return NotFound(new { message = "Link is not valid or it is expired." });
            }
            return Ok(result);
        }
    }
}

using Common.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using TravelService.Data;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/shared/{token}")]
    public class SharedEditController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _http;
        private readonly IConfiguration _config;

        private const string TravelBase   = "http://localhost:5002";
        private const string ActivityBase = "http://localhost:5003";
        private const string PlanningBase = "http://localhost:5004";

        public SharedEditController(
            AppDbContext context,
            IHttpClientFactory http,
            IConfiguration config)
        {
            _context = context;
            _http = http;
            _config = config;
        }

        [HttpPost("activities")]
        public Task<IActionResult> CreateActivity(string token, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Post,
                tripId => $"{ActivityBase}/api/trips/{tripId}/activities",
                body);

        [HttpPut("activities/{activityId:int}")]
        public Task<IActionResult> UpdateActivity(string token, int activityId, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Put,
                tripId => $"{ActivityBase}/api/trips/{tripId}/activities/{activityId}",
                body);

        [HttpDelete("activities/{activityId:int}")]
        public Task<IActionResult> DeleteActivity(string token, int activityId)
            => Proxy(token, HttpMethod.Delete,
                tripId => $"{ActivityBase}/api/trips/{tripId}/activities/{activityId}",
                null);

        [HttpPost("checklist")]
        public Task<IActionResult> CreateChecklistItem(string token, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Post,
                tripId => $"{PlanningBase}/api/trips/{tripId}/checklist",
                body);

        [HttpPatch("checklist/{itemId:int}")]
        public Task<IActionResult> ToggleChecklistItem(string token, int itemId, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Patch,
                tripId => $"{PlanningBase}/api/trips/{tripId}/checklist/{itemId}",
                body);

        [HttpDelete("checklist/{itemId:int}")]
        public Task<IActionResult> DeleteChecklistItem(string token, int itemId)
            => Proxy(token, HttpMethod.Delete,
                tripId => $"{PlanningBase}/api/trips/{tripId}/checklist/{itemId}",
                null);

        [HttpPost("destinations")]
        public Task<IActionResult> CreateDestination(string token, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Post,
                tripId => $"{TravelBase}/api/trips/{tripId}/destinations",
                body);

        [HttpPut("destinations/{destId:int}")]
        public Task<IActionResult> UpdateDestination(string token, int destId, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Put,
                tripId => $"{TravelBase}/api/trips/{tripId}/destinations/{destId}",
                body);

        [HttpDelete("destinations/{destId:int}")]
        public Task<IActionResult> DeleteDestination(string token, int destId)
            => Proxy(token, HttpMethod.Delete,
                tripId => $"{TravelBase}/api/trips/{tripId}/destinations/{destId}",
                null);

        [HttpPost("expenses")]
        public Task<IActionResult> CreateExpense(string token, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Post,
                tripId => $"{PlanningBase}/api/trips/{tripId}/expenses",
                body);

        [HttpDelete("expenses/{expenseId:int}")]
        public Task<IActionResult> DeleteExpense(string token, int expenseId)
            => Proxy(token, HttpMethod.Delete,
                tripId => $"{PlanningBase}/api/trips/{tripId}/expenses/{expenseId}",
                null);

        [HttpPut("trip")]
        public Task<IActionResult> UpdateTrip(string token, [FromBody] JsonElement body)
            => Proxy(token, HttpMethod.Put,
                tripId => $"{TravelBase}/api/trips/{tripId}",
                body);

        private async Task<IActionResult> Proxy(
            string shareToken,
            HttpMethod method,
            Func<int, string> buildUrl,
            JsonElement? body)
        {
            var st = await _context.ShareTokens
                .Include(x => x.Trip)
                .FirstOrDefaultAsync(x => x.Token == shareToken);

            if (st == null || !st.IsActive || st.ExpiresAt < DateTime.UtcNow)
                return NotFound(new { message = "Share link is invalid or has expired." });

            if (st.AccessType != TokenAccessType.edit)
                return StatusCode(403, new { message = "This link is read-only." });

            var jwt = GenerateInternalToken(st.Trip.UserId);

            var client = _http.CreateClient();
            var req = new HttpRequestMessage(method, buildUrl(st.TripId));
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

            if (body.HasValue && body.Value.ValueKind != JsonValueKind.Undefined)
            {
                req.Content = new StringContent(
                    body.Value.GetRawText(),
                    Encoding.UTF8,
                    "application/json");
            }

            var resp = await client.SendAsync(req);
            var content = await resp.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
                return StatusCode((int)resp.StatusCode);

            return BuildContentResult(content, "application/json", (int)resp.StatusCode);
        }

        private string GenerateInternalToken(int userId)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role,           "service"),
                new Claim("token_type",              "internal"),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ContentResult BuildContentResult(string content, string contentType, int statusCode)
            => new ContentResult
            {
                Content = content,
                ContentType = contentType,
                StatusCode = statusCode,
            };
    }
}
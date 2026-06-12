using Common.DTOs;
using Common.Interfaces;
using System.Net.Http.Json;

namespace ActivityService.Clients
{
    public class TripApiClient : ITripClient
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TripApiClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<TripDto?> GetByIdAsync(int tripId, string? bearerToken = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/trips/{tripId}");

            var token = bearerToken
                ?? _httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();

            if (!string.IsNullOrWhiteSpace(token))
                request.Headers.TryAddWithoutValidation("Authorization",
                    token.StartsWith("Bearer ") ? token : $"Bearer {token}");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<TripDto>();
        }

        public async Task DeleteAllByUserAsync(int userId, string bearerToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete,
                $"/api/trips/user/{userId}/all");
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            await _httpClient.SendAsync(request);
        }
    }
}
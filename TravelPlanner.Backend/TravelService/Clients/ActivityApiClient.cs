using Common.DTOs;

namespace TravelService.Clients
{
    public class ActivityApiClient
    {
        private readonly HttpClient _httpClient;

        public ActivityApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<ActivityDto>> GetByTripIdAsync(int tripId, string? bearerToken = null)
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"/api/trips/{tripId}/activities");

            if (!string.IsNullOrEmpty(bearerToken))
                request.Headers.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<ActivityDto>>()
                   ?? new List<ActivityDto>();
        }
    }
}
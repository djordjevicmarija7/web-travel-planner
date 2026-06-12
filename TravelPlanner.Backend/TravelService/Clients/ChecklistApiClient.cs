using Common.DTOs;
using Common.Interfaces;

namespace TravelService.Clients
{
    public class ChecklistApiClient : IChecklistClient
    {
        private readonly HttpClient _httpClient;

        public ChecklistApiClient(HttpClient httpClient) { _httpClient = httpClient; }

        public async Task<List<ChecklistItemDto>> GetByTripIdAsync(int tripId, string? bearerToken = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Get,
                $"/api/trips/{tripId}/checklist");
            if (!string.IsNullOrEmpty(bearerToken))
                request.Headers.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<ChecklistItemDto>>()
                   ?? new List<ChecklistItemDto>();
        }

        public async Task DeleteAllByTripAsync(int tripId, string bearerToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete,
                $"/api/trips/{tripId}/all");
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            await _httpClient.SendAsync(request);
        }
    }
}
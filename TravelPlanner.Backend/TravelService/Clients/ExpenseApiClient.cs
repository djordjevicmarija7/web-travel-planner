using Common.DTOs;

namespace TravelService.Clients
{
    public class ExpenseApiClient
    {
        private readonly HttpClient _httpClient;

        public ExpenseApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<ExpenseDto>> GetByTripIdAsync(int tripId, string? bearerToken = null)
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"/api/trips/{tripId}/expenses");

            if (!string.IsNullOrEmpty(bearerToken))
                request.Headers.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<ExpenseDto>>()
                   ?? new List<ExpenseDto>();
        }
    }
}
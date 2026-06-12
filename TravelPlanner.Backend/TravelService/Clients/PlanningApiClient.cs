using Common.Interfaces;

namespace TravelService.Clients
{
    public class PlanningApiClient : IPlanningClient
    {
        private readonly HttpClient _httpClient;
        public PlanningApiClient(HttpClient httpClient) { _httpClient = httpClient; }

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
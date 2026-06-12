using Common.DTOs;
using Common.Interfaces;

namespace UserService.Clients
{
    public class TripApiClient : ITripClient
    {
        private readonly HttpClient _httpClient;

        public TripApiClient(HttpClient httpClient) { _httpClient = httpClient; }

        public async Task<TripDto?> GetByIdAsync(int tripId, string? bearerToken = null)
        {
            throw new NotImplementedException();
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
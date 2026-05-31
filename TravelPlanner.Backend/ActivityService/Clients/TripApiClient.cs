using Common.DTOs;
namespace ActivityService.Clients
{
    public class TripApiClient
    {
        private readonly HttpClient _httpClient;

        public TripApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<TripDto?> GetTripAsync(int tripId)
        {
            var response = await _httpClient.GetAsync($"/api/trips/{tripId}");

            if (!response.IsSuccessStatusCode)
                return null;

            return await response.Content.ReadFromJsonAsync<TripDto>();
        }
    }
}

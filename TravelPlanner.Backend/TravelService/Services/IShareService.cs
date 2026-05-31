using Common.DTOs;

namespace TravelService.Services
{
    public interface IShareService
    {
        Task<ShareTokenDto> CreateTokenAsync(int tripId, CreateShareTokenDto dto, int userId);
        Task<List<ShareTokenDto>> GetTokensByTripAsync(int tripId, int userId);
        Task<SharedTripDto?> GetSharedTripAsync(string token);
        Task<bool> RevokeTokenAsync(int tokenId, int userId);
    }
}

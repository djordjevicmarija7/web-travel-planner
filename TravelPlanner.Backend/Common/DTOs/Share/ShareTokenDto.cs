using Common.Enums;

namespace Common.DTOs
{
    public class ShareTokenDto
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public TokenAccessType AccessType { get; set; } = TokenAccessType.view;
        public int TripId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }
}

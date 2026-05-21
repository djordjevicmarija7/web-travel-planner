namespace TravelService.DTOs
{
    public class ShareTokenDto
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessType {  get; set; } = string.Empty; 
        public int TripId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }
}

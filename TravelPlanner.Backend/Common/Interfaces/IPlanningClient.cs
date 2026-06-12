namespace Common.Interfaces
{
    public interface IPlanningClient
    {
        Task DeleteAllByTripAsync(int tripId, string bearerToken);
    }
}
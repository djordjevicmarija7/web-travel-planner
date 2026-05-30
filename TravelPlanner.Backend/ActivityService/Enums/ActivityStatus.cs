using System.Text.Json.Serialization;

namespace ActivityService.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ActivityStatus
    {
        planned,
        reserved,
        completed,
        cancelled
    }
}
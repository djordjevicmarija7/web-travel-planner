using System.Text.Json.Serialization;

namespace Common.Enums
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
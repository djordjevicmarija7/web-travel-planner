using System.Text.Json.Serialization;

namespace TravelService.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TokenAccessType
    {
        view,
        edit
    }
}


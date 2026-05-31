using System.Text.Json.Serialization;

namespace Common.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ExpenseCategory
    {
        transport,
        accommodation,
        food,
        tickets,
        shopping,
        other
    }
}

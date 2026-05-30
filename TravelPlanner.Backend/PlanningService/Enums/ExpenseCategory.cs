using System.Text.Json.Serialization;

namespace PlanningService.Enums
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

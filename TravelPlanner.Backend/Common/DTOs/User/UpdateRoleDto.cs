using Common.Enums;
using System.Text.Json.Serialization;

namespace Common.DTOs
{
    public class UpdateRoleDto
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole Role { get; set; } = UserRole.user;
    }
}

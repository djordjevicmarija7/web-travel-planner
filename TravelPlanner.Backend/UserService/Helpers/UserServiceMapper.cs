using AutoMapper;
using Common.DTOs;
using UserService.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace UserService.Helpers
{
    public class UserServiceMapper : Profile
    {
        public UserServiceMapper()
        {
            CreateMap<User, UserDto>();
            CreateMap<User, AuthResponseDto>()
                .ForMember(dest => dest.Token, opt => opt.Ignore());
        }
    }
}
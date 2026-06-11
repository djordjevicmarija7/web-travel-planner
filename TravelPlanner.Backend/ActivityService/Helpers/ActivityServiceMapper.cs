using AutoMapper;
using ActivityService.Models;
using Common.DTOs;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ActivityService.Helpers
{
    public class ActivityServiceMapper : Profile
    {
        public ActivityServiceMapper()
        {
            CreateMap<Activity, ActivityDto>();
        }
    }
}
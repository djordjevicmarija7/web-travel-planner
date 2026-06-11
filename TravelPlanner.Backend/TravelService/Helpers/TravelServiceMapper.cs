using AutoMapper;
using Common.DTOs;
using TravelService.Models;

namespace TravelService.Helpers
{
    public class TravelServiceMapper : Profile
    {
        public TravelServiceMapper()
        {
            CreateMap<Trip, TripDto>()
                .ForMember(dest => dest.Activities, opt => opt.Ignore())
                .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
                .ForMember(dest => dest.Expenses, opt => opt.Ignore());
            CreateMap<Destination, DestinationDto>();
            CreateMap<ShareToken, ShareTokenDto>();
        }
    }
}
using AutoMapper;
using Common.DTOs;
using PlanningService.Models;

namespace PlanningService.Helpers
{
    public class PlanningServiceMapper : Profile
    {
        public PlanningServiceMapper()
        {
            CreateMap<ChecklistItem, ChecklistItemDto>();
            CreateMap<Expense, ExpenseDto>();
        }
    }
}
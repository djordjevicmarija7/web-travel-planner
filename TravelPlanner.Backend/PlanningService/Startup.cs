using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Data;
using System.Text;
using PlanningService.Data;
using PlanningService.Services;
namespace PlanningService
{
    public class Startup
    {
            private readonly IConfiguration _configuration;
            private readonly IReliableStateManager _stateManager;

            public Startup(IConfiguration configuration, IReliableStateManager stateManager)
            {
                _configuration = configuration;
                _stateManager = stateManager;
            }

            public void ConfigureServices(IServiceCollection services)
            {
                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlServer(
                        _configuration.GetConnectionString("DefaultConnection")));
                services.AddScoped<IChecklistService, ChecklistService>();
                services.AddScoped<IExpenseService, ExpenseService>();

                services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = _configuration["Jwt:Issuer"],
                            ValidAudience = _configuration["Jwt:Audience"],
                            IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!))
                        };
                    });
                services.AddAuthorization();
                services.AddControllers();

                services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                    });
                });
                services.AddEndpointsApiExplorer();
                services.AddSwaggerGen();
            }
            public void Configure(WebApplication app)
            {
                if (app.Environment.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI();
                }
                app.UseCors("AllowFrontend");
                app.UseAuthentication();
                app.UseAuthorization();
                app.MapControllers();
            }
        }
    }


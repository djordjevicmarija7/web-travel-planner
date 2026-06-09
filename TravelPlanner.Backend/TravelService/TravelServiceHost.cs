using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.Text;
using TravelService.Clients;
using TravelService.Data;
using TravelService.Services;
using TravelService.Hubs;

namespace TravelService
{
    internal sealed class TravelServiceHost : StatelessService
    {
        public TravelServiceHost(StatelessServiceContext context)
            : base(context) { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new[]
            {
                new ServiceInstanceListener(context =>
                    new KestrelCommunicationListener(context, "ServiceEndpoint", (url, listener) =>
                    {
                        var builder = WebApplication.CreateBuilder();
                        builder.Configuration
                            .SetBasePath(builder.Environment.ContentRootPath)
                            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                            .AddEnvironmentVariables();
                        builder.WebHost.UseKestrel();
                        builder.WebHost.UseUrls(url);

                        builder.Services.AddDbContext<AppDbContext>(options =>
                            options.UseSqlServer(
                                builder.Configuration.GetConnectionString("DefaultConnection")));

                        builder.Services.AddScoped<ITripService, TripService>();
                        builder.Services.AddScoped<IDestinationService, DestinationService>();
                        builder.Services.AddScoped<IShareService, ShareService>();
                        builder.Services.AddHttpClient<ActivityApiClient>(c =>
                            c.BaseAddress = new Uri("http://localhost:5003"));

                        builder.Services.AddHttpClient<ExpenseApiClient>(c =>
                            c.BaseAddress = new Uri("http://localhost:5004"));

                        builder.Services.AddHttpClient<ChecklistApiClient>(c =>
                            c.BaseAddress = new Uri("http://localhost:5004"));
                        builder.Services.AddHttpClient();
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer = true,
                                    ValidateAudience = true,
                                    ValidateLifetime = true,
                                    ValidateIssuerSigningKey = true,
                                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                                    ValidAudience = builder.Configuration["Jwt:Audience"],
                                    IssuerSigningKey = new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                                };
                                    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };

                            });

                        builder.Services.AddAuthorization();
                        builder.Services.AddControllers();
                        builder.Services.AddSignalR();
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowFrontend", policy =>
                            {
                                policy.WithOrigins("http://localhost:5173")
                                      .AllowAnyHeader()
                                      .AllowAnyMethod()
                                      .AllowCredentials();
                            });
                        });
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        var app = builder.Build();

                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseCors("AllowFrontend");
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();
                        app.MapHub<TripHub>("/hubs/trips");
                        app.MapHub<DestinationHub>("/hubs/destinations");
                        return app;
                    }))
            };
        }
    }
}
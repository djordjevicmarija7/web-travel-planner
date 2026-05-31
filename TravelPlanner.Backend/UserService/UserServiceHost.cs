using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.Text;
using System.Text.Json.Serialization;
using UserService.Data;
using UserService.Services;

namespace UserService
{
    internal sealed class UserServiceHost : StatelessService
    {
        public UserServiceHost(StatelessServiceContext context)
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

                        builder.Services.AddScoped<IAuthService, AuthService>();
                        builder.Services.AddScoped<IAdminService, AdminService>();

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
                            });

                        builder.Services.AddAuthorization();
                        builder.Services.AddControllers()
                            .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
                        builder.Services.AddHttpClient();
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowFrontend", policy =>
                            {
                                policy.WithOrigins("http://localhost:5173")
                                      .AllowAnyHeader()
                                      .AllowAnyMethod();
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
                        return app;
                    }))
            };
        }
    }
}
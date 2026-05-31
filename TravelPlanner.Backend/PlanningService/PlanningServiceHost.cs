using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;

namespace PlanningService
{
    internal sealed class PlanningServiceHost : StatefulService
    {
        public PlanningServiceHost(StatefulServiceContext context)
            : base(context) { }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return new[]
            {
                new ServiceReplicaListener(context =>
                    new KestrelCommunicationListener(context, "ServiceEndpoint", (url, listener) =>
                    {
                        var builder = WebApplication.CreateBuilder();
                        builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();
                        builder.WebHost.UseKestrel();
                        builder.WebHost.UseUrls(url);
                        builder.Services.AddSingleton<IReliableStateManager>(this.StateManager);

                        var startup = new Startup(builder.Configuration, this.StateManager);
                        startup.ConfigureServices(builder.Services);

                        var app = builder.Build();
                        startup.Configure(app);
                        return app;
                    }))
            };
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            await this.StateManager
                .GetOrAddAsync<IReliableDictionary<int, bool>>("checklistState");
            await this.StateManager
                .GetOrAddAsync<IReliableDictionary<int, string>>("expenseTotals");

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}
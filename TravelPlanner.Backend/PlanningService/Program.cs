using Microsoft.ServiceFabric.Services.Runtime;
using PlanningService;

try
{
    ServiceRuntime.RegisterServiceAsync(
        "PlanningServiceType",
        context => new PlanningServiceHost(context))
        .GetAwaiter().GetResult();
    Thread.Sleep(Timeout.Infinite);
}
catch (Exception e)
{
    Console.WriteLine(e);
    throw;
}
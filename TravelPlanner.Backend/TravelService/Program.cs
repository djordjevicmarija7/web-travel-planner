using Microsoft.ServiceFabric.Services.Runtime;
using TravelService;

try
{
    ServiceRuntime.RegisterServiceAsync(
        "TravelServiceType",
        context => new TravelServiceHost(context))
        .GetAwaiter().GetResult();

    Thread.Sleep(Timeout.Infinite);
}
catch (Exception e)
{
    Console.WriteLine(e);
    throw;
}
using Microsoft.ServiceFabric.Services.Runtime;
using ActivityService;

try
{
    ServiceRuntime.RegisterServiceAsync(
        "ActivityServiceType",
        context => new ActivityServiceHost(context))
        .GetAwaiter().GetResult();

    Thread.Sleep(Timeout.Infinite);
}
catch (Exception e)
{
    Console.WriteLine(e);
    throw;
}
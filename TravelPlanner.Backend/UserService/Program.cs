using Microsoft.ServiceFabric.Services.Runtime;
using UserService;

try
{
    ServiceRuntime.RegisterServiceAsync(
        "UserServiceType",
        context => new UserServiceHost(context))
        .GetAwaiter().GetResult();

    Thread.Sleep(Timeout.Infinite);
}
catch (Exception e)
{
    Console.WriteLine(e);
    throw;
}
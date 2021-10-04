using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Sentry.AspNetCore;
using Sentry.AspNetCore.Grpc;

namespace DnsTools.Worker
{
	public class Program
	{
		public static void Main(string[] args)
		{
			CreateHostBuilder(args).Build().Run();
		}

		public static IHostBuilder CreateHostBuilder(string[] args) =>
			Host.CreateDefaultBuilder(args)
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder
						.UseStartup<Startup>()
						.UseSentry(builder =>
						{
							builder.AddGrpc();
							builder.AddSentryOptions(options =>
							{
								options.Release = ThisAssembly.Git.Sha;
							});
						});
				});
	}
}

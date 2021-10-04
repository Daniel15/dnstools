using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace DnsTools.Web
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var host = CreateWebHostBuilder(args).Build();
			DeleteOldSocketIfExists(host);
			host.Run();
		}

		private static void DeleteOldSocketIfExists(IWebHost host)
		{
			// Delete UNIX pipe if it exists at startup (eg. previous process crashed before cleaning it up)
			// Workaround for https://github.com/aspnet/AspNetCore/issues/14134
			var addressFeature = host.ServerFeatures.Get<IServerAddressesFeature>();
			var url = BindingAddress.Parse(addressFeature.Addresses.First());
			if (url.IsUnixPipe && File.Exists(url.UnixPipePath))
			{
				Console.WriteLine("UNIX pipe {0} already existed, deleting it.", url.UnixPipePath);
				File.Delete(url.UnixPipePath);
			}
		}

		public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
			WebHost.CreateDefaultBuilder(args)
				.ConfigureAppConfiguration(config =>
				{
					// Config shared between client-side and server-side
					config.AddJsonFile("ClientApp/src/config.json");
				})
				.UseStartup<Startup>()
				.UseSentry(options =>
				{
					options.Release = ThisAssembly.Git.Sha;
				});
	}
}

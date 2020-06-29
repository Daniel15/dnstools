using DnsTools.Worker.Middleware;
using DnsTools.Worker.Models;
using DnsTools.Worker.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prometheus;
using Prometheus.SystemMetrics;

namespace DnsTools.Worker
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
		public void ConfigureServices(IServiceCollection services)
		{
			services.Configure<AccessControlConfig>(Configuration);
			services.AddGrpc();
			services.AddResponseCompression(config =>
			{
				config.EnableForHttps = true;
				// Enable compression mainly for Prometheus metrics.
				// Intentionally removing Brotli due to https://github.com/dotnet/runtime/issues/36245
				config.Providers.Clear();
				config.Providers.Add<GzipCompressionProvider>();
			});
			services.AddSystemMetrics();
			DnsToolsMetrics.Initialize();
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseRouting();
			app.UseAccessControlMiddleware();
			app.UseHttpMetrics();
			app.UseGrpcMetrics();
			app.UseResponseCompression();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapMetrics();
				endpoints.MapGrpcService<DnsToolsService>();

				endpoints.MapGet("/hello", async context =>
				{
					await context.Response.WriteAsync("Hello World");
				});

				endpoints.MapGet("/", async context =>
				{
					await context.Response.WriteAsync("Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");
				});
			});
		}
	}
}

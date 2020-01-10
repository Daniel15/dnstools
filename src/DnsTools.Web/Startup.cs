using System;
using DnsClient;
using DnsTools.Web.HealthChecks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models.Config;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Web.Utils;
using HealthChecks.Publisher.Prometheus;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using WebpackTag;

namespace DnsTools.Web
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			// Default caching DNS client, eg. for reverse DNS lookups
			services.AddSingleton<ILookupClient>(_ => new LookupClient
			{
				UseCache = true
			});

			services.Configure<AppConfig>(Configuration);
			services.AddSingleton<IWorkerProvider, WorkerProvider>();
			services.AddSingleton<IMaxMind, Services.MaxMind>();
			services.AddSingleton<IIpDataProvider, IpDataProvider>();
			services.AddScoped<ICaptcha, Captcha>();

			services.AddSingleton<TracerouteRunner>();

			services.AddWebpackTag(config =>
			{
				config.DevServerPort = 31429;
			});
			services.AddControllersWithViews();
			services.AddSignalR().AddJsonProtocol(options =>
			{
				options.PayloadSerializerOptions.IgnoreNullValues = true;
			});

			// In production, the React files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/build";
			});

			services.AddDistributedMemoryCache();
			services.AddSession(options =>
			{
				options.IdleTimeout = TimeSpan.FromHours(1);
				options.Cookie.HttpOnly = true;
				options.Cookie.IsEssential = true;
				options.Cookie.Name = ".DnsTools.Session";
				options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
			});

			ConfigureHealthChecks(services.AddHealthChecks());
		}

		private void ConfigureHealthChecks(IHealthChecksBuilder builder)
		{
			var config = Configuration.Get<AppConfig>();
			foreach (var worker in config.Workers)
			{
				builder.AddTypeActivatedCheck<WorkerHealthCheck>($"worker_{worker.Id}", worker.Id);
			}
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
				// Allow unencrypted gRPC calls in development
				AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
			}
			else
			{
				app.UseExceptionHandler("/Error/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseForwardedHeaders(new ForwardedHeadersOptions
			{
				ForwardedHeaders = ForwardedHeaders.XForwardedFor
			});
			app.UseStaticFiles();
			app.UseSpaStaticFiles();
			app.UseSession();

			app.UseRouting();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapHealthChecks("/health");
				endpoints.MapHealthChecks("/health/json", new HealthCheckOptions
				{
					ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
				});
				endpoints.MapHealthChecks("/health/prom", new HealthCheckOptions
				{
					ResponseWriter = (context, report) => PrometheusResponseWriter.WritePrometheusResultText(context, report)
				});

				endpoints.MapHub<ToolsHub>("/hub");
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller}/{action=Index}/{id?}");
			});

			if (env.IsDevelopment())
			{
				app.UseSpa(spa =>
				{
					spa.Options.SourcePath = "ClientApp";
					spa.UseProxyToSpaDevelopmentServer("http://localhost:31429");
				});
			}
		}
	}
}

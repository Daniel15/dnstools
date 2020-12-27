using System;
using System.Collections.Generic;
using DnsClient;
using DnsTools.Web.HealthChecks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models.Config;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Web.Utils;
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

namespace DnsTools.Web
{
	public class Startup
	{
		private const string CORS_PROD = "prod";
		private const string CORS_DEV = "dev";
		
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			// Default caching DNS client, eg. for reverse DNS lookups
			services.AddSingleton<ILookupClient>(_ => new LookupClient(new LookupClientOptions
			{
				UseCache = true
			}));

			services.Configure<AppConfig>(Configuration);
			services.AddSingleton<IHttp2PushManifestHandler, Http2PushManifestHandler>();
			services.AddSingleton<IWorkerProvider, WorkerProvider>();
			services.AddSingleton<IMaxMind, Services.MaxMind>();
			services.AddSingleton<IIpDataProvider, IpDataProvider>();
			services.AddScoped<ICaptcha, Captcha>();

			services.AddSingleton<TracerouteRunner>();

			services.AddHttpClient();
			services.AddHttpContextAccessor();

			services.AddCors(options =>
			{
				options.AddPolicy(CORS_PROD , builder =>
				{
					builder.WithOrigins("https://dnstools.ws")
						.AllowAnyHeader()
						.AllowCredentials();
				});
				
				options.AddPolicy(CORS_DEV, builder =>
				{
					builder.WithOrigins(
						// create-react-app server
						"http://localhost:31429",
						// react-snap server
						"http://localhost:45678"
					)
					.AllowAnyHeader()
					.AllowCredentials();
				});
			});

			services.AddControllersWithViews();
			services.AddSignalR().AddJsonProtocol(options =>
			{
				options.PayloadSerializerOptions.IgnoreNullValues = true;
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
			app.UseSession();

			app.UseRouting();
			app.UseCors(env.IsDevelopment() ? CORS_DEV : CORS_PROD);

			app.UseHealthChecksPrometheusExporter("/health/prom", options =>
			{
				options.ResultStatusCodes = new Dictionary<HealthStatus, int>
				{
					// Always return HTTP 200 so Prometheus sees the request as successful.
					{HealthStatus.Healthy, 200},
					{HealthStatus.Degraded, 200},
					{HealthStatus.Unhealthy, 200},
				};
			});
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapHealthChecks("/health");
				endpoints.MapHealthChecks("/health/json", new HealthCheckOptions
				{
					ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
				});

				endpoints.MapHub<ToolsHub>("/hub");
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller}/{action=Index}/{id?}");
			});
		}
	}
}

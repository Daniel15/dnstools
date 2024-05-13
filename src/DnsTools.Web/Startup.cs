using System;
using System.Collections.Generic;
using System.Net;
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

const string CORS_PROD = "prod";
const string CORS_DEV = "dev";

var builder = WebApplication.CreateBuilder(args);

builder.WebHost
	.UseSentry(options =>
	{
		options.Release = ThisAssembly.Git.Sha;
	});

var config = builder.Configuration;
// Config shared between client-side and server-side
config.AddJsonFile("ClientApp/src/config.json");

var services = builder.Services;
// Default caching DNS client, eg. for reverse DNS lookups
services.AddSingleton<ILookupClient>(_ => new LookupClient(new LookupClientOptions
{
	UseCache = true
}));

services.Configure<AppConfig>(config);
services.AddSentryTunneling("errors.d.sb");
services.AddSingleton<IHttp2PushManifestHandler, Http2PushManifestHandler>();
services.AddSingleton<IWorkerProvider, WorkerProvider>();
services.AddSingleton<IIpDataProvider, IpDataProvider>();
services.AddScoped<ICaptcha, Captcha>();

services.AddSingleton<IIpDataLoader, IpInfoIpDataLoader>();
services.AddSingleton<IIpDataLoader, MaxMindIpDataLoader>();

services.AddSingleton<TracerouteRunner>();
services.AddTransient<MtrRunner>();

services.AddHttpClient();
services.AddHttpContextAccessor();

services.AddCors(options =>
{
	options.AddPolicy(CORS_PROD , builder =>
	{
		builder.WithOrigins("https://dnstools.ws", "https://staging.dnstools.ws")
			.AllowAnyHeader()
			.AllowCredentials();
	});
	
	options.AddPolicy(CORS_DEV, builder =>
	{
		builder.WithOrigins(
			// create-react-app server
			"http://localhost:64329",
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseDeveloperExceptionPage();
	// Allow unencrypted gRPC calls in development
	AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
}
else
{
	app.UseExceptionHandler("/Error/Error");
	app.UseStatusCodePagesWithReExecute("/Error/Status{0}");
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
app.UseCors(app.Environment.IsDevelopment() ? CORS_DEV : CORS_PROD);
app.UseSentryTunneling("/error/log");

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

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/json", new HealthCheckOptions
{
	ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
});

app.MapHub<ToolsHub>("/hub");
app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}"
);

app.Run();

return;

void ConfigureHealthChecks(IHealthChecksBuilder builder)
{
	var appConfig = config.Get<AppConfig>();
	foreach (var worker in appConfig.Workers)
	{
		builder.AddTypeActivatedCheck<WorkerHealthCheck>($"worker_{worker.Id}", worker.Id);
	}
}

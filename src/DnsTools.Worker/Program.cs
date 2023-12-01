using DnsTools.Worker.Middleware;
using DnsTools.Worker.Models;
using DnsTools.Worker.Services;
using Microsoft.AspNetCore.ResponseCompression;
using Prometheus;
using Prometheus.SystemMetrics;
using Sentry.AspNetCore;
using Sentry.AspNetCore.Grpc;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseSentry(sentryBuilder =>
{
	sentryBuilder.AddGrpc();
	sentryBuilder.AddSentryOptions(options =>
	{
		options.Release = ThisAssembly.Git.Sha;
	});
});

var services = builder.Services;
services.Configure<AccessControlConfig>(builder.Configuration);
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseAccessControlMiddleware();
app.UseHttpMetrics();
app.UseGrpcMetrics();
app.UseResponseCompression();

app.MapMetrics();
app.MapGrpcService<DnsToolsService>();

app.MapGet("/hello", () => "Hello World");
app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();

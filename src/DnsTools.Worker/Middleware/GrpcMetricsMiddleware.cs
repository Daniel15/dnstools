using System.Threading.Tasks;
using Grpc.AspNetCore.Server;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Prometheus;

namespace DnsTools.Worker.Middleware
{
	/// <summary>
	/// Middleware for recording gRPC metrics for Prometheus
	/// Temporary until https://github.com/prometheus-net/prometheus-net/pull/212 is merged.
	/// </summary>
	public class GrpcMetricsMiddleware
	{
		private readonly RequestDelegate _next;

		private readonly Counter _receivedRequests = Metrics.CreateCounter(
			"grpc_requests_received_total",
			"Number of received gRPC requests",
			new CounterConfiguration
			{
				LabelNames = new[] { "service", "method" }
			}
		);

		public GrpcMetricsMiddleware(RequestDelegate next)
		{
			_next = next;
		}

		public async Task Invoke(HttpContext context)
		{
			try
			{
				await _next(context);
			}
			finally
			{
				LogRequest(context);
			}
		}

		private void LogRequest(HttpContext context)
		{
			var metadata = context.GetEndpoint()?.Metadata?.GetMetadata<GrpcMethodMetadata>();
			var method = metadata?.Method;
			if (method == null)
			{
				return;
			}

			_receivedRequests.WithLabels(method.ServiceName, method.Name).Inc();
		}
	}

	public static class GrpcMetricsMiddlewareExtensions
	{
		public static IApplicationBuilder UseGrpcMetrics(this IApplicationBuilder builder)
		{
			return builder.UseMiddleware<GrpcMetricsMiddleware>();
		}
	}
}

using System;
using System.Threading.Tasks;
using DnsTools.Worker.Models;
using DnsTools.Worker.Tools;
using Grpc.Core;
using Microsoft.Extensions.DependencyInjection;
using Sentry;

namespace DnsTools.Worker.Services
{
	public class DnsToolsService : DnsToolsWorker.DnsToolsWorkerBase
	{
		public override async Task Ping(
			PingRequest request, 
			IServerStreamWriter<PingResponse> responseStream, 
			ServerCallContext context
		)
		{
			await RunTool<PingRequest, PingResponse, Ping>(request, responseStream, context).ConfigureAwait(false);
		}

		public override async Task Traceroute(
			TracerouteRequest request,
			IServerStreamWriter<TracerouteResponse> responseStream,
			ServerCallContext context
		)
		{
			await RunTool<TracerouteRequest, TracerouteResponse, Traceroute>(request, responseStream, context);
		}

		public override async Task DnsLookup(
			DnsLookupRequest request, 
			IServerStreamWriter<DnsLookupResponse> responseStream, 
			ServerCallContext context
		)
		{
			await RunTool<DnsLookupRequest, DnsLookupResponse, DnsLookup>(request, responseStream, context);
		}

		public override async Task DnsTraversal(
			DnsTraversalRequest request,
			IServerStreamWriter<DnsTraversalResponse> responseStream,
			ServerCallContext context
		)
		{
			await RunTool<DnsTraversalRequest, DnsTraversalResponse, DnsTraversal>(request, responseStream, context);
		}

		public override async Task Mtr(
			TracerouteRequest request,
			IServerStreamWriter<MtrResponse> responseStream,
			ServerCallContext context
		)
		{
			await RunTool<TracerouteRequest, MtrResponse, Mtr>(request, responseStream, context);
		}

		private async Task RunTool<TRequest, TResponse, TTool>(
			TRequest request,
			IServerStreamWriter<TResponse> responseStream,
			ServerCallContext context
		) 
			where TTool : ITool<TRequest, TResponse> 
			where TResponse : IHasError, new()
		{
			try
			{
				await ActivatorUtilities.CreateInstance<TTool>(context.GetHttpContext().RequestServices)
					.RunAsync(request, responseStream, context.CancellationToken);
			}
			catch (Exception ex)
			{
				if (ex is OperationCanceledException)
				{
					// Cancellation doesn't need to bubble up an error message.
					return;
				}

				await responseStream.WriteAsync(new TResponse
				{
					Error = new Error
					{
						Message = ex.Message,
					}
				});
				SentrySdk.CaptureException(ex);
			}
		}
	}
}

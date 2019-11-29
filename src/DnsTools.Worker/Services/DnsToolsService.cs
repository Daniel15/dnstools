using System.Threading.Tasks;
using DnsTools.Worker.Models;
using DnsTools.Worker.Tools;
using Grpc.Core;
using Microsoft.Extensions.DependencyInjection;

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

		private async Task RunTool<TRequest, TResponse, TTool>(
			TRequest request,
			IServerStreamWriter<TResponse> responseStream,
			ServerCallContext context
		) 
			where TTool : BaseCliTool<TRequest, TResponse> 
			where TResponse : IHasError, new()
		{
			await context.GetHttpContext().RequestServices.GetRequiredService<TTool>()
				.RunAsync(request, responseStream, context.CancellationToken);
		}
	}
}

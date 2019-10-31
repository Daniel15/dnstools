using System.Threading.Tasks;
using DnsTools.Worker.Tools;
using Grpc.Core;

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
			await new Ping().RunAsync(request, responseStream, context.CancellationToken);
		}

		public override async Task Traceroute(
			TracerouteRequest request,
			IServerStreamWriter<TracerouteResponse> responseStream,
			ServerCallContext context
		)
		{
			await new Traceroute().RunAsync(request, responseStream, context.CancellationToken);
		}
	}
}

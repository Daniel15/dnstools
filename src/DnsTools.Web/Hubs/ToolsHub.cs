using System.Threading;
using System.Threading.Channels;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Worker;
using Microsoft.AspNetCore.SignalR;

namespace DnsTools.Web.Hubs
{
	public class ToolsHub : Hub<IToolsHub>
	{
		private readonly IWorkerProvider _workerProvider;

		public ToolsHub(IWorkerProvider workerProvider)
		{
			_workerProvider = workerProvider;
		}

		public ChannelReader<WorkerResponse<PingResponse>> Ping(
			PingRequest request,
			CancellationToken cancellationToken
		)
		{
			return new ToolRunner<PingResponse>(_workerProvider).Run(
				cancellationToken,
				client => client.Ping(new PingRequest
				{
					Host = request.Host,
					Protocol = request.Protocol
				}, cancellationToken: cancellationToken));
		}

		public ChannelReader<WorkerResponse<TracerouteResponse>> Traceroute(
			PingRequest request,
			CancellationToken cancellationToken
		)
		{
			return new ToolRunner<TracerouteResponse>(_workerProvider).Run(
				cancellationToken,
				client => client.Traceroute(new TracerouteRequest
				{
					Host = request.Host,
					Protocol = request.Protocol
				}, cancellationToken: cancellationToken));
		}
	}
}

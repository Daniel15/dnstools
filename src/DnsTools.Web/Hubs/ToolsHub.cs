using System;
using System.Threading;
using System.Threading.Channels;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Worker;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace DnsTools.Web.Hubs
{
	public class ToolsHub : Hub<IToolsHub>
	{
		private readonly IWorkerProvider _workerProvider;
		private readonly IServiceProvider _serviceProvider;

		public ToolsHub(IWorkerProvider workerProvider, IServiceProvider serviceProvider)
		{
			_workerProvider = workerProvider;
			_serviceProvider = serviceProvider;
		}

		public ChannelReader<WorkerResponse<PingResponse>> Ping(
			PingRequest request,
			CancellationToken cancellationToken
		)
		{

			return new GenericRunner<PingRequest, PingResponse>(
				_workerProvider,
				client => client.Ping(new PingRequest
				{
					Host = request.Host,
					Protocol = request.Protocol
				}, cancellationToken: cancellationToken)).Run(request, Clients.Caller, cancellationToken);
		}

		public ChannelReader<WorkerResponse<TracerouteResponse>> Traceroute(
			TracerouteRequest request,
			CancellationToken cancellationToken
		)
		{
			return _serviceProvider.GetRequiredService<TracerouteRunner>()
				.Run(request, Clients.Caller, cancellationToken);
		}
	}
}

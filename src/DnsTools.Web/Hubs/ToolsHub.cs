using System;
using System.Threading;
using System.Threading.Channels;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Worker;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using PingRequest = DnsTools.Web.Models.PingRequest;

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
				client => client.Ping(new Worker.PingRequest
				{
					Host = request.Host,
					Protocol = request.Protocol
				}, cancellationToken: cancellationToken)).Run(request, Clients.Caller, request.Workers, cancellationToken);
		}

		public ChannelReader<WorkerResponse<TracerouteResponse>> Traceroute(
			PingRequest request,
			CancellationToken cancellationToken
		)
		{
			return _serviceProvider.GetRequiredService<TracerouteRunner>()
				.Run(new TracerouteRequest
				{
					Host = request.Host,
					Protocol = request.Protocol
				}, Clients.Caller, request.Workers, cancellationToken);
		}
	}
}

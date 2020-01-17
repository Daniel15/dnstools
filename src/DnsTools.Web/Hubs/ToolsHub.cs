using System;
using System.Collections.Immutable;
using System.Threading;
using System.Threading.Channels;
using DnsTools.Web.Models;
using DnsTools.Web.Models.Config;
using DnsTools.Web.Services;
using DnsTools.Web.Tools;
using DnsTools.Worker;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using DnsLookupRequest = DnsTools.Web.Models.DnsLookupRequest;
using PingRequest = DnsTools.Web.Models.PingRequest;

namespace DnsTools.Web.Hubs
{
	public class ToolsHub : Hub<IToolsHub>
	{
		private readonly IWorkerProvider _workerProvider;
		private readonly IServiceProvider _serviceProvider;
		private readonly string _defaultWorker;

		public ToolsHub(IWorkerProvider workerProvider, IServiceProvider serviceProvider, IOptions<AppConfig> config)
		{
			_workerProvider = workerProvider;
			_serviceProvider = serviceProvider;
			_defaultWorker = config.Value.DefaultWorker;
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

		public ChannelReader<WorkerResponse<DnsLookupResponse>> DnsLookup(
			DnsLookupRequest request,
			CancellationToken cancellationToken
		)
		{
			var workers = request.Workers ?? new[] { _defaultWorker }.ToImmutableHashSet();
			return new GenericRunner<DnsLookupRequest, DnsLookupResponse>(
				_workerProvider,
				client => client.DnsLookup(new Worker.DnsLookupRequest
				{
					Host = request.Host,
					Type = request.Type,
				}, cancellationToken: cancellationToken)).Run(request, Clients.Caller, workers, cancellationToken);
		}

		public ChannelReader<WorkerResponse<DnsTraversalResponse>> DnsTraversal(
			DnsLookupRequest request,
			CancellationToken cancellationToken
		)
		{
			var workers = request.Workers ?? new[] { _defaultWorker }.ToImmutableHashSet();
			return new GenericRunner<DnsLookupRequest, DnsTraversalResponse>(
				_workerProvider,
				client => client.DnsTraversal(new Worker.DnsLookupRequest
				{
					Host = request.Host,
					Type = request.Type,
				}, cancellationToken: cancellationToken)).Run(request, Clients.Caller, workers, cancellationToken);
		}
	}
}

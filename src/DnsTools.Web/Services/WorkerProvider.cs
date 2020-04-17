using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Net.Http;
using DnsTools.Web.Models.Config;
using DnsTools.Worker;
using Grpc.Net.Client;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Provides worker configuration
	/// </summary>
	public class WorkerProvider : IWorkerProvider
	{
		private const string LOCAL_WORKER = "local";

		private readonly IList<WorkerConfig> _configs;
		private readonly IReadOnlyDictionary<string, GrpcChannel> _channels;

		private ImmutableDictionary<string, WorkerStatus> _status = 
			ImmutableDictionary<string, WorkerStatus>.Empty;

		public WorkerProvider(IOptions<AppConfig> config)
		{
			_configs = config.Value.Workers;
			_channels = _configs.ToImmutableDictionary(
				x => x.Id,
				x => GrpcChannel.ForAddress(GetEndpoint(x.Id), new GrpcChannelOptions
				{
					DisposeHttpClient = true,
					HttpClient = new HttpClient(new SocketsHttpHandler
					{
						ConnectTimeout = config.Value.WorkerConnectTimeout
					})
				})
			);
		}

		/// <summary>
		/// Gets a list of all the enabled worker configs
		/// </summary>
		public IEnumerable<WorkerConfig> GetWorkerConfigs()
		{
			return _configs;
		}

		/// <summary>
		/// Creates a client for each enabled worker config
		/// </summary>
		public IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateAllClients()
		{
			return CreateClients(_ => true);
		}

		/// <summary>
		/// Creates a client for the given worker configs
		/// </summary>
		public IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateClients(ImmutableHashSet<string> workerIds)
		{
			return CreateClients(worker => workerIds.Contains(worker.Id));
		}

		/// <summary>
		/// Creates a client for the given worker.
		/// </summary>
		public DnsToolsWorker.DnsToolsWorkerClient CreateClient(string workerId)
		{
			return new DnsToolsWorker.DnsToolsWorkerClient(_channels[workerId]);
		}

		private IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateClients(Func<WorkerConfig, bool> filterFn)
		{
			return GetWorkerConfigs().Where(filterFn).ToDictionary(
				config => config.Id,
				config => CreateClient(config.Id)
			);
		}

		/// <summary>
		/// Sets the status of the specified worker.
		/// </summary>
		public void SetStatus(string workerId, WorkerStatus status)
		{
			_status = _status.SetItem(workerId, status);
		}

		/// <summary>
		/// Gets the status of the specified worker.
		/// </summary>
		public WorkerStatus GetStatus(string workerId)
		{
			return _status.GetValueOrDefault(workerId, WorkerStatus.Available);
		}

		/// <summary>
		/// Gets the URI for the specified worker.
		/// </summary>
		private static Uri GetEndpoint(string workerId)
		{
			return workerId == LOCAL_WORKER
				? new Uri("http://localhost:55000")
				: new Uri($"https://{workerId}.worker.dns.tg:54561");
		}
	}
}

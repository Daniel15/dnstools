using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
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
		private readonly IList<WorkerConfig> _configs;
		private readonly IReadOnlyDictionary<string, GrpcChannel> _channels;

		public WorkerProvider(IOptions<AppConfig> config)
		{
			_configs = config.Value.Workers;
			_channels = _configs.ToImmutableDictionary(
				x => x.Id,
				x => GrpcChannel.ForAddress(x.Endpoint)
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
	}
}

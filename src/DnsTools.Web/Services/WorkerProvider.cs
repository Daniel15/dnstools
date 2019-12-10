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

		public WorkerProvider(IOptions<AppConfig> config)
		{
			_configs = config.Value.Workers;
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

		private IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateClients(Func<WorkerConfig, bool> filterFn)
		{
			return GetWorkerConfigs().Where(filterFn).ToDictionary(
				config => config.Id,
				config =>
				{
					var channel = GrpcChannel.ForAddress(config.Endpoint);
					return new DnsToolsWorker.DnsToolsWorkerClient(channel);
				});
		}
	}
}

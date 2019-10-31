using System.Collections.Generic;
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
			return GetWorkerConfigs().ToDictionary(
				config => config.Id,
				config =>
				{
					var channel = GrpcChannel.ForAddress(config.Endpoint);
					return new DnsToolsWorker.DnsToolsWorkerClient(channel);
				});
		}
	}
}

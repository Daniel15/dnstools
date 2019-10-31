using System.Collections.Generic;
using DnsTools.Web.Models.Config;
using DnsTools.Worker;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Provides worker configuration
	/// </summary>
	public interface IWorkerProvider
	{
		/// <summary>
		/// Gets a list of all the enabled worker configs
		/// </summary>
		IEnumerable<WorkerConfig> GetWorkerConfigs();

		/// <summary>
		/// Creates a client for each enabled worker config
		/// </summary>
		IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateAllClients();
	}
}

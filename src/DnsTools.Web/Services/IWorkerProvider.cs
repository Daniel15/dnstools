using System;
using System.Collections.Generic;
using System.Collections.Immutable;
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

		/// <summary>
		/// Creates a client for the given worker configs
		/// </summary>
		IDictionary<string, DnsToolsWorker.DnsToolsWorkerClient> CreateClients(ImmutableHashSet<string> workerIds);

		/// <summary>
		/// Creates a client for the given worker.
		/// </summary>
		DnsToolsWorker.DnsToolsWorkerClient CreateClient(string workerId);

		/// <summary>
		/// Sets the status of the specified worker.
		/// </summary>
		void SetStatus(string workerId, WorkerStatus status);

		/// <summary>
		/// Gets the status of the specified worker.
		/// </summary>
		WorkerStatus GetStatus(string workerId);
	}
}

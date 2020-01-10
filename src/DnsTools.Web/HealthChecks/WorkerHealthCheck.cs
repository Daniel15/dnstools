using System;
using System.Threading;
using System.Threading.Tasks;
using DnsTools.Web.Services;
using DnsTools.Worker;
using Grpc.Core;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DnsTools.Web.HealthChecks
{
	/// <summary>
	/// Determines if all workers are accessible
	/// </summary>
	public class WorkerHealthCheck : IHealthCheck
	{
		private readonly IWorkerProvider _workerProvider;
		private readonly string _id;

		public WorkerHealthCheck(IWorkerProvider workerProvider, string id)
		{
			_workerProvider = workerProvider;
			_id = id;
		}

		/// <summary>
		/// Runs the health check, returning the status of the component being checked.
		/// </summary>
		/// <param name="context">A context object associated with the current execution.</param>
		/// <param name="cancellationToken">A <see cref="T:System.Threading.CancellationToken" /> that can be used to cancel the health check.</param>
		/// <returns>A <see cref="T:System.Threading.Tasks.Task`1" /> that completes when the health check has finished, yielding the status of the component being checked.</returns>
		public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
		{
			try
			{
				var client = _workerProvider.CreateClient(_id);
				var response = client.DnsLookup(new DnsLookupRequest
				{
					Host = "example.com",
					Type = DnsLookupType.A,
				}, cancellationToken: cancellationToken);

				// Read the stream until the end
				await foreach (var _ in response.ResponseStream.ReadAllAsync(cancellationToken)) { }
				return HealthCheckResult.Healthy();
			}
			catch (Exception ex)
			{
				return HealthCheckResult.Unhealthy("DNS lookups failing", ex);
			}
		}
	}
}

using System;

namespace DnsTools.Web.Models.Config
{
	/// <summary>
	/// Represents the configuration for a worker.
	/// </summary>
	public class WorkerConfig
	{
		/// <summary>
		/// Internal identifier for the worker. Must be unique.
		/// </summary>
		public string Id { get; set; } = default!;

		/// <summary>
		/// User-friendly name for the worker.
		/// </summary>
		public string Name { get; set; } = default!;

		/// <summary>
		/// Two-letter country code where worker is based.
		/// </summary>
		public string Country { get; set; } = default!;

		/// <summary>
		/// Specific location where worker is based.
		/// </summary>
		public string Location { get; set; } = default!;

		/// <summary>
		/// URI to connect to worker.
		/// </summary>
		public Uri Endpoint { get; set; } = default!;
	}
}

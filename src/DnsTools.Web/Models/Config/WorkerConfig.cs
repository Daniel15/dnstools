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
		public string Id { get; set; }

		/// <summary>
		/// User-friendly name for the worker.
		/// </summary>
		public string Name { get; set; }

		/// <summary>
		/// Two-letter country code where worker is based.
		/// </summary>
		public string Country { get; set; }

		/// <summary>
		/// Specific location where worker is based.
		/// </summary>
		public string Location { get; set; }

		/// <summary>
		/// URI to connect to worker.
		/// </summary>
		public Uri Endpoint { get; set; }
	}
}

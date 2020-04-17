namespace DnsTools.Web.Models.Config
{
	/// <summary>
	/// Represents the configuration for a worker. This just contains parts of the configuration
	/// that are used server-side.
	/// </summary>
	public class WorkerConfig
	{
		/// <summary>
		/// Internal identifier for the worker. Must be unique.
		/// </summary>
		public string Id { get; set; } = default!;
	}
}

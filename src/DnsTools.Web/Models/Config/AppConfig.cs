using System.Collections.Generic;

namespace DnsTools.Web.Models.Config
{
	/// <summary>
	/// Represents the app configuration
	/// </summary>
	public class AppConfig
	{
		public IList<WorkerConfig> Workers { get; set; } = new List<WorkerConfig>();

		public string MaxMindCityPath { get; set; } = default!;

		public string MaxMindAsnPath { get; set; } = default!;
	}
}

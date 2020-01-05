using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;

namespace DnsTools.Web.Models.Config
{
	/// <summary>
	/// Represents the app configuration
	/// </summary>
	public class AppConfig
	{
		public IList<WorkerConfig> Workers { get; set; } = new List<WorkerConfig>();

		public string DefaultWorker { get; set; } = default!;

		public string MaxMindCityPath { get; set; } = default!;

		public string MaxMindAsnPath { get; set; } = default!;

		public ReCaptchaConfig ReCaptcha { get; set; } = default!;

		public class ReCaptchaConfig
		{
			public string SiteKey { get; set; } = default!;

			public string SecretKey { get; set; } = default!;
		}

	}
}

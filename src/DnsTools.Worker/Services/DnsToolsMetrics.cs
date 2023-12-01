using System.Reflection;
using System.Runtime.CompilerServices;
using Prometheus;

namespace DnsTools.Worker.Services
{
	public static class DnsToolsMetrics
	{
		public static void Initialize()
		{
			var assembly = Assembly.GetExecutingAssembly();
			var assemblyVersion = assembly.GetName().Version?.ToString();

			Metrics.CreateGauge(
				"dnstools_is_aot", 
				"Whether the worker is using AOT compilation"
			).Set(RuntimeFeature.IsDynamicCodeSupported ? 0 : 1);

			if (assemblyVersion != null)
			{
				Metrics.CreateGauge(
					"dnstools_version",
					"Version number of DNSTools worker assembly",
					"version",
					"commit"
				).WithLabels(assemblyVersion, ThisAssembly.Git.Commit).Set(1);
			}
		}
	}
}

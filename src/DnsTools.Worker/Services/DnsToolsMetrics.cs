using System;
using System.IO;
using System.Reflection;
using Prometheus;

namespace DnsTools.Worker.Services
{
	public static class DnsToolsMetrics
	{
		public static void Initialize()
		{
			var assembly = Assembly.GetExecutingAssembly();
			var assemblyVersion = assembly.GetName().Version?.ToString();
			var assemblyWriteTime = new DateTimeOffset(File.GetLastWriteTimeUtc(assembly.Location));

			Metrics.CreateGauge(
				"dnstools_deploy_time_seconds", 
				"Last modified date of the DNSTools worker assembly"
			).SetToTimeUtc(assemblyWriteTime);

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

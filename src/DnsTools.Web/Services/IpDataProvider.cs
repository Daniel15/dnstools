using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;
using Microsoft.Extensions.Logging;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Loads data for IP addresses
	/// </summary>
	public class IpDataProvider : IIpDataProvider
	{
		private readonly IMaxMind _maxMind;
		private readonly ILogger<IpDataProvider> _logger;

		public IpDataProvider(IMaxMind maxMind, ILogger<IpDataProvider> logger)
		{
			_maxMind = maxMind;
			_logger = logger;
		}

		/// <summary>
		/// Loads data about the specified IP address
		/// </summary>
		/// <param name="ip">IP address to load data for</param>
		/// <param name="onDataLoaded">
		/// Callback called when new data is available. This can be called multiple times,
		/// as data becomes available (eg. DNS requests complete)
		/// </param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		public async Task LoadDataAsync(
			IPAddress ip,
			Func<IpData, Task> onDataLoaded
		)
		{
			var subTasks = new[]
			{
				LoadMaxmind(ip),
				LoadReverseDns(ip),
			}.Select(async task =>
			{
				var result = await task.ConfigureAwait(false);
				if (result != null)
				{
					await onDataLoaded(result).ConfigureAwait(false);
				}
			});

			await Task.WhenAll(subTasks).ConfigureAwait(false);
		}

		/// <summary>
		/// Loads data about the specified IP address, and pushes the resulting data to
		/// the specified SignalR hub client.
		/// </summary>
		/// <param name="rawIp">IP address to load data for</param>
		/// <param name="client">SignalR client</param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		public async Task LoadDataAsync(string? rawIp, IToolsHub client)
		{
			if (rawIp != null)
			{
				var ip = IPAddress.Parse(rawIp);
				await LoadDataAsync(ip, async data => await client.IpDataLoaded(rawIp, data));
			}
		}

		private Task<IpData?> LoadMaxmind(IPAddress ip)
		{
			IpData? data = null;

			try
			{
				var city = _maxMind.City(ip);
				var asn = _maxMind.Asn(ip);
				if (city != null || asn != null)
				{
					data = new IpData
					{
						Asn = asn?.AutonomousSystemNumber,
						AsnName = asn?.AutonomousSystemOrganization,
						City = city?.City?.Name,
						Country = city?.Country?.Name,
						CountryIso = city?.Country?.IsoCode,
					};
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Could not load MaxMind data for {ip}: {ex.Message}");
			}

			return Task.FromResult(data);
		}

		private async Task<IpData?> LoadReverseDns(IPAddress ip)
		{
			try
			{
				var dns = await Dns.GetHostEntryAsync(ip);
				return new IpData
				{
					HostName = dns.HostName,
				};
			} 
			catch (Exception ex)
			{
				_logger.LogDebug(ex, $"Could not load reverse DNS data for {ip}: {ex.Message}");
				return null;
			}
		}
	}
}

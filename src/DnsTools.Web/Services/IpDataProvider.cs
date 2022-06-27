using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using DnsClient;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;
using DnsTools.Worker.Extensions;
using Microsoft.Extensions.Logging;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Loads data for IP addresses
	/// </summary>
	public class IpDataProvider : IIpDataProvider
	{
		private readonly IEnumerable<IIpDataLoader> _dataLoaders;
		private readonly ILookupClient _dns;
		private readonly ILogger<IpDataProvider> _logger;

		public IpDataProvider(IEnumerable<IIpDataLoader> dataLoaders, ILookupClient dns, ILogger<IpDataProvider> logger)
		{
			_dataLoaders = dataLoaders;
			_dns = dns;
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
		/// <param name="cancellationToken">Cancellation token for if the request is cancelled</param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		public async Task LoadDataAsync(
			IPAddress ip,
			Func<IpData, Task> onDataLoaded,
			CancellationToken cancellationToken
		)
		{
			var subTasks = new[]
			{
				LoadIpData(ip),
				LoadReverseDns(ip, cancellationToken),
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
		/// <param name="cancellationToken">Cancellation token for if the request is cancelled</param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		public async Task LoadDataAsync(string? rawIp, IToolsHub client, CancellationToken cancellationToken)
		{
			if (rawIp != null)
			{
				var ip = IPAddress.Parse(rawIp);
				await LoadDataAsync(ip, async data => await client.IpDataLoaded(rawIp, data), cancellationToken);
			}
		}

		private async Task<IpData?> LoadIpData(IPAddress ip)
		{
			if (ip.IsPrivate())
			{
				return null;
			}

			IpData? ipData = null;
			foreach (var dataLoader in _dataLoaders)
			{
				try
				{
					ipData = await dataLoader.LoadIpData(ip);
					if (ipData != null)
					{
						break;
					}
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, $"Could not load {dataLoader.GetType().Name} data for {ip}: {ex.Message}");
				}
			}

			if (ipData == null)
			{
				return null;
			}

			if (ipData.Asn == null || ipData.AsnName == null)
			{
				// If the data loader didn't return ASN, get it from Maxmind
				// TODO: This is UGLY, but .NET doesn't let us register one class for multiple interfaces
				// https://andrewlock.net/how-to-register-a-service-with-multiple-interfaces-for-in-asp-net-core-di/
				var maxmind = _dataLoaders.First(x => x is MaxMindIpDataLoader) as MaxMindIpDataLoader;
				var maxmindResult = maxmind.LoadIpData(ip).Result;
				ipData.Asn = maxmindResult.Asn;
				ipData.AsnName = maxmindResult.AsnName;
			}

			return ipData;
		}

		private async Task<IpData?> LoadReverseDns(IPAddress ip, CancellationToken cancellationToken)
		{
			try
			{
				var response = await _dns.QueryReverseAsync(ip, cancellationToken);
				var ptr = response.Answers.PtrRecords().FirstOrDefault();
				return ptr == null
					? null
					: new IpData
					{
						HostName = ptr.PtrDomainName.ToString().TrimEnd('.')
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

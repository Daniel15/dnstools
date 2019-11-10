using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Loads data for IP addresses
	/// </summary>
	public class IpDataProvider : IIpDataProvider
	{
		private readonly IMaxMind _maxMind;

		public IpDataProvider(IMaxMind maxMind)
		{
			_maxMind = maxMind;
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
			var subTasks = new List<Task>();

			var city = _maxMind.City(ip);
			var asn = _maxMind.Asn(ip);

			if (city != null || asn != null)
			{
				var data = new IpData
				{
					Asn = asn?.AutonomousSystemNumber,
					AsnName = asn?.AutonomousSystemOrganization,
					City = city?.City?.Name,
					Country = city?.Country?.Name,
					CountryIso = city?.Country?.IsoCode,
				};
				subTasks.Add(onDataLoaded(data));
			}

			await Task.WhenAll(subTasks);
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
	}
}

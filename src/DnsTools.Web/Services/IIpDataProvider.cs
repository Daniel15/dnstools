using System;
using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Loads data for IP addresses
	/// </summary>
	public interface IIpDataProvider
	{
		/// <summary>
		/// Loads data about the specified IP address
		/// </summary>
		/// <param name="ip">IP address to load data for</param>
		/// <param name="onDataLoaded">
		/// Callback called when new data is available. This can be called multiple times,
		/// as data becomes available (eg. DNS requests complete)
		/// </param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		Task LoadDataAsync(
			IPAddress ip,
			Func<IpData, Task> onDataLoaded
		);

		/// <summary>
		/// Loads data about the specified IP address, and pushes the resulting data to
		/// the specified SignalR hub client.
		/// </summary>
		/// <param name="ip">IP address to load data for</param>
		/// <param name="client">SignalR client</param>
		/// <returns>A task that resolves when all data lookups have completed</returns>
		Task LoadDataAsync(
			string? ip,
			IToolsHub client
		);
	}
}

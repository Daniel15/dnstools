using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Models;

namespace DnsTools.Web.Hubs
{
	/// <summary>
	/// Strongly-typed SignalR hub for DNSTools
	/// </summary>
	public interface IToolsHub
	{
		/// <summary>
		/// Pushes data about an IP address to the client
		/// </summary>
		/// <param name="ip">IP address</param>
		/// <param name="data">Data that was loaded</param>
		Task IpDataLoaded(string ip, IpData data);
	}
}

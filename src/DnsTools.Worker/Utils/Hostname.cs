using System;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using DnsTools.Worker.Extensions;

namespace DnsTools.Worker.Utils
{
	/// <summary>
	/// Utilities relating to host names.
	/// </summary>
	public static class Hostname
	{
		/// <summary>
		/// Asserts that the specified hostname is valid. If not valid, throws an exception.
		/// </summary>
		/// <param name="host">Host name to validate</param>
		public static void AssertValid(string host)
		{
			var result = Uri.CheckHostName(host);
			if (result == UriHostNameType.Basic || result == UriHostNameType.Unknown)
			{
				throw new ArgumentException($"Invalid host name '{host}'");
			}

			if (IPAddress.TryParse(host, out var ip))
			{
				AssertValidIp(ip);
			}
		}

		/// <summary>
		/// Asserts that the specified IP is valid.
		/// </summary>
		/// <param name="ip">The IP to validate</param>
		public static void AssertValidIp(IPAddress ip)
		{
			if (ip.IsPrivate())
			{
				throw new ArgumentException("Private IPs are not allowed");
			}
		}

		public static async Task<IPAddress> GetIp(string host, Protocol protocol)
		{
			AssertValid(host);

			var ips = await Dns.GetHostAddressesAsync(host);
			// Find first IP that matches requested protocol
			var ip = ips.FirstOrDefault(x =>
				protocol == Protocol.Any ||
				(protocol == Protocol.Ipv4 && x.AddressFamily == AddressFamily.InterNetwork) ||
				(protocol == Protocol.Ipv6 && x.AddressFamily == AddressFamily.InterNetworkV6)
			);

			if (ip == null)
			{
				string protocolLabel;
				switch (protocol)
				{
					case Protocol.Ipv4:
						protocolLabel = "IPv4";
						break;
					case Protocol.Ipv6:
						protocolLabel = "IPv6";
						break;
					case Protocol.Any:
						protocolLabel = "IPv4 or IPv6";
						break;
					default:
						throw new ArgumentOutOfRangeException();
				}
				throw new ArgumentException($"No {protocolLabel} address for {host}");
			}

			return ip;
		}
	}
}

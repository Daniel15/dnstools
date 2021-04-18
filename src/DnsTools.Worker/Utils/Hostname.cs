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
			var ipv4 = ips.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);
			var ipv6 = ips.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetworkV6);
			var ip = protocol switch
			{
				Protocol.Ipv4 => ipv4,
				Protocol.Ipv6 => ipv6,
				Protocol.Any => ipv6 ?? ipv4,
				_ => throw new ArgumentOutOfRangeException(nameof(protocol), protocol, null),
			};
			if (ip != null)
			{
				AssertValidIp(ip);
				return ip;
			}

			var protocolLabel = protocol switch
			{
				Protocol.Ipv4 => "IPv4",
				Protocol.Ipv6 => "IPv6",
				Protocol.Any => "IPv4 or IPv6",
				_ => throw new ArgumentOutOfRangeException(nameof(protocol), protocol, null),
			};
			throw new ArgumentException($"No {protocolLabel} address for {host}");
		}
	}
}

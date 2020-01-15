using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DnsClient;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Shared behaviour between the "DNS Lookup" and "DNS Traversal" tools
	/// </summary>
	public abstract class BaseDnsLookup
	{
		/// <summary>
		/// The timeout for DNS lookups.
		/// </summary>
		protected static readonly TimeSpan _timeout = TimeSpan.FromSeconds(3);

		/// <summary>
		/// The root DNS servers.
		/// </summary>
		protected static readonly IReadOnlyList<string> _rootServers = new List<string>
		{
			"a.root-servers.net",
			"b.root-servers.net",
			"c.root-servers.net",
			"d.root-servers.net",
			"e.root-servers.net",
			"f.root-servers.net",
			"g.root-servers.net",
			"h.root-servers.net",
			"i.root-servers.net",
			"j.root-servers.net",
			"k.root-servers.net",
			"l.root-servers.net",
			"m.root-servers.net",
		}.ToImmutableList();

		/// <summary>
		/// If the request is for a PTR lookup and the input is an IP address, converts it to the
		/// relevant <c>.arpa</c> domain.
		/// </summary>
		protected static string ConvertToArpaNameIfRequired(DnsLookupRequest request)
		{
			// When doing reverse DNS lookups, convert IP to the relevant .arpa domain
			if (request.Type == DnsLookupType.Ptr)
			{
				var isIp = IPAddress.TryParse(request.Host, out var ip);
				if (isIp)
				{
					return ip.GetArpaName();
				}
			}

			return request.Host;
		}

		/// <summary>
		/// Given a DNS server hostname, gets its IP. If the specified response contains glue (additional)
		/// records, gets the IP from those, otherwise performs a DNS lookup to obtain it.
		/// </summary>
		/// <param name="hostname">The DNS server hostname.</param>
		/// <param name="response">The response that may contain glue records</param>
		/// <returns>IP addresses of the server</returns>
		protected static async Task<IPAddress[]> GetDnsServerIPs(string hostname, IDnsQueryResponse? response = null)
		{
			var newServerIps = Array.Empty<IPAddress>();

			// See if glue was provided with an IP
			if (response != null)
			{
				newServerIps = response.Additionals.ARecords()
					.Where(x => x.DomainName.Value == hostname)
					.Select(x => x.Address)
					.Concat(
						response.Additionals.AaaaRecords()
							.Where(x => x.DomainName.Value == hostname)
							.Select(x => x.Address)
					)
					.ToArray();
			}

			if (newServerIps.Length == 0)
			{
				// No glue, so we need to look up the server IP
				newServerIps = await Dns.GetHostAddressesAsync(hostname);
			}

			return newServerIps;
		}
	}
}

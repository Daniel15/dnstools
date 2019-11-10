using System.Net;

namespace DnsTools.Web.Models
{
	/// <summary>
	/// Data about an IP address.
	/// </summary>
	public class IpData
	{
		public long? Asn { get; set; }

		public string? AsnName { get; set; }

		public string? City { get; set; }

		public string? Country { get; set; }

		public string? CountryIso { get; set; }
	}
}

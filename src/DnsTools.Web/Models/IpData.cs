using System.Net;
using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models
{
	/// <summary>
	/// Data about an IP address.
	/// </summary>
	[TsInterface(AutoI = false)]
	public class IpData
	{
		[TsProperty(ForceNullable = true)]
		public long? Asn { get; set; }

		[TsProperty(ForceNullable = true)]
		public string? AsnName { get; set; }

		[TsProperty(ForceNullable = true)]
		public string? City { get; set; }

		[TsProperty(ForceNullable = true)]
		public string? Country { get; set; }

		[TsProperty(ForceNullable = true)]
		public string? CountryIso { get; set; }

		[TsProperty(ForceNullable = true)]
		public string? HostName { get; set; }
	}
}

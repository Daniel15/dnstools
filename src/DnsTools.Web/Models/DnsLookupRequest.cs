using System.Collections.Immutable;
using DnsTools.Worker;
using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models
{
	[TsInterface(AutoI = false)]
	public class DnsLookupRequest
	{
		public string Host { get; set; } = default!;

		public DnsLookupType Type { get; set; } = DnsLookupType.A;

		[TsProperty(Type = "ReadonlyArray<string>", ForceNullable = true)]
		public ImmutableHashSet<string>? Workers { get; set; }
	}
}

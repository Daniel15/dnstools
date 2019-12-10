using System.Collections.Generic;
using System.Collections.Immutable;
using DnsTools.Worker;
using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models
{
	[TsInterface(AutoI = false)]
	public class PingRequest
	{
		public string Host { get; set; }

		public Protocol Protocol { get; set; }

		[TsProperty(Type = "ReadonlyArray<string>", ForceNullable = true)]
		public ImmutableHashSet<string>? Workers { get; set; }
	}
}

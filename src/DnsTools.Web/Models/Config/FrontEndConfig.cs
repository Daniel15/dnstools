using System.Collections.Generic;
using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models.Config
{
	[TsInterface(AutoI = false, Name = "Config")]
	public class FrontEndConfig
	{
		public IEnumerable<WorkerConfig> Workers { get; set; } = default!;
	}
}

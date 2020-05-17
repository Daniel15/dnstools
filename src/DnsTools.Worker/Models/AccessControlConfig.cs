using System.Collections.Generic;
using System.Linq;

namespace DnsTools.Worker.Models
{
	public class AccessControlConfig
	{
		public IList<string> AllowedIps { get; set; } = new List<string>();
	}
}

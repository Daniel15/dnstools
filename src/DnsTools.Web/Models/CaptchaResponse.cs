using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models
{
	[TsInterface(AutoI = false)]
	public class CaptchaResponse
	{
		public bool Success { get; set; } = false;
		public string? Error { get; set; }
	}
}

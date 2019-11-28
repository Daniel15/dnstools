using System.Net;

namespace DnsTools.Worker.Extensions
{
	/// <summary>
	/// Extension methods for <see cref="IPAddress"/>.
	/// </summary>
	public static class IpExtensions
	{
		public static bool IsPrivate(this IPAddress address)
		{
			var bytes = address.GetAddressBytes();
			return bytes[0] switch
			{
				10 => true,
				127 => true,
				172 => (bytes[1] >= 16 && bytes[1] < 32),
				192 => (bytes[1] == 168),
				_ => false
			};
		}
	}
}

using Google.Protobuf;

namespace DnsTools.Worker.Models
{
	/// <summary>
	/// Represents a request for a DNS lookup or traversal.
	/// </summary>
	public interface IDnsLookupRequest : IMessage
	{
		public string Host { get; }
		public DnsLookupType Type { get; }
	}
}

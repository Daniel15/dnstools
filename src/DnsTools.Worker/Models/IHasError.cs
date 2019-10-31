using Google.Protobuf;

namespace DnsTools.Worker.Models
{
	/// <summary>
	/// Represents a Protobuf message that has an Error field.
	/// </summary>
	public interface IHasError : IMessage
	{
		Error Error { get; set; }
	}
}

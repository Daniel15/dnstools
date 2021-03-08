using DnsTools.Worker.Models;

namespace DnsTools.Worker
{
	// Adds `IHasError` interface to Protobuf classes

	public sealed partial class PingResponse : IHasError { }
	public sealed partial class TracerouteResponse : IHasError { }
	public sealed partial class DnsLookupResponse : IHasError { }
	public sealed partial class DnsTraversalResponse : IHasError { }
	public sealed partial class MtrResponse : IHasError { }

	// Adds `IDnsLookupRequest` interface to DNS lookup and traversal requests

	public sealed partial class DnsLookupRequest : IDnsLookupRequest { }
	public sealed partial class DnsTraversalRequest : IDnsLookupRequest { }
}

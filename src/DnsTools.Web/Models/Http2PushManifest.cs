using System.Collections.Generic;

namespace DnsTools.Web.Models
{
	/// <summary>
	/// Represents a http2-push-manifest.json file
	/// </summary>
	public class Http2PushManifest
	{
		/// <summary>
		/// Source URL (eg. "/").
		/// </summary>
		public string Source { get; set; } = default!;

		/// <summary>
		/// Headers to send for this URL.
		/// </summary>
		public IList<Header>? Headers { get; set; }

		/// <summary>
		/// A header value.
		/// </summary>
		public class Header
		{
			/// <summary>
			/// The key of the header.
			/// </summary>
			public string? Key { get; set; }

			/// <summary>
			/// The value of the header.
			/// </summary>
			public string? Value { get; set; }
		}
	}
}

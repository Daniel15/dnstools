using Microsoft.AspNetCore.Http;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Handles pushing critical JS and CSS files via HTTP/2 push, based on the
	/// http2-push-manifest file output by react-snap.
	/// </summary>
	public interface IHttp2PushManifestHandler
	{
		/// <summary>
		/// Render the headers for pushing the CSS and JS files
		/// </summary>
		void SendHeaders(string route, HttpResponse response);
	}
}

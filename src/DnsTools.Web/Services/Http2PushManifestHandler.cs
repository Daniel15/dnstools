using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using System.Text.Json;
using DnsTools.Web.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Handles pushing critical JS and CSS files via HTTP/2 push, based on the
	/// http2-push-manifest file output by react-snap.
	/// </summary>
	public class Http2PushManifestHandler : IHttp2PushManifestHandler
	{
		private const string MANIFEST_PATH = @"ClientApp/build/http2-push-manifest.json";

		private readonly ImmutableDictionary<string, ImmutableList<Http2PushManifest.Header>> _manifest;

		public Http2PushManifestHandler(IWebHostEnvironment env)
		{
			_manifest = ReadManifest(env);
		}

		private static ImmutableDictionary<string, ImmutableList<Http2PushManifest.Header>> ReadManifest(IWebHostEnvironment env)
		{
			var manifestFile = env.ContentRootFileProvider.GetFileInfo(MANIFEST_PATH);
			if (!manifestFile.Exists)
			{
				// No push manifest, for some reason
				return ImmutableDictionary<string, ImmutableList<Http2PushManifest.Header>>.Empty;
			}

			var rawManifest = File.ReadAllText(manifestFile.PhysicalPath);
			var manifest = JsonSerializer.Deserialize<IList<Http2PushManifest>>(rawManifest, new JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true
			});

			var dict = ImmutableDictionary.CreateBuilder<string, ImmutableList<Http2PushManifest.Header>>();
			foreach (var manifestItem in manifest)
			{
				dict.Add(manifestItem.Source, manifestItem.Headers?.ToImmutableList() ?? ImmutableList<Http2PushManifest.Header>.Empty);
			}
			return dict.ToImmutable();
		}

		/// <summary>
		/// Render the headers for pushing the CSS and JS files
		/// </summary>
		public void SendHeaders(string route, HttpResponse response)
		{
			if (!_manifest.TryGetValue(route, out var headers))
			{
				return;
			}

			foreach (var header in headers)
			{
				response.Headers.AppendCommaSeparatedValues(header.Key, header.Value);
			}
		}
	}
}

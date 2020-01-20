using System;
using System.Text.Json.Serialization;
using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models.Config
{
	/// <summary>
	/// Represents the configuration for a worker.
	/// </summary>
	[TsInterface(AutoI = false)]
	public class WorkerConfig
	{
		/// <summary>
		/// Internal identifier for the worker. Must be unique.
		/// </summary>
		public string Id { get; set; } = default!;

		/// <summary>
		/// City the worker is located in
		/// </summary>
		public string City { get; set; } = default!;

		/// <summary>
		/// Region the worker is located in.
		/// </summary>
		public string Region { get; set; } = default!;

		/// <summary>
		/// Two-letter country code where worker is based..
		/// </summary>
		public string Country { get; set; } = default!;

		/// <summary>
		/// Name of the provider the server is hosted with.
		/// </summary>
		public string ProviderName { get; set; } = default!;

		/// <summary>
		/// URL of the provider the server is hosted with.
		/// </summary>
		[TsProperty(Type = "string")]
		public Uri ProviderUrl { get; set; } = default!;

		/// <summary>
		/// Name of the data center the server is located in.
		/// </summary>
		public string DataCenterName { get; set; } = default!;

		/// <summary>
		/// ASN of the network the worker is hosted on.
		/// </summary>
		public int NetworkAsn { get; set; } = default!;

		/// <summary>
		/// How to display the worker's location in the UI
		/// </summary>
		public string LocationDisplay { get; set; } = default!;

		/// <summary>
		/// URI to connect to worker.
		/// </summary>
		[JsonIgnore]
		[TsIgnore]
		public Uri Endpoint { get; set; } = default!;
	}
}

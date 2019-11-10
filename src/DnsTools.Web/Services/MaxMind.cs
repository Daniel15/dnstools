using System.Net;
using DnsTools.Web.Models.Config;
using MaxMind.GeoIP2;
using MaxMind.GeoIP2.Responses;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Wrapper around MaxMind GeoIP database
	/// </summary>
	public class MaxMind : IMaxMind
	{
		private readonly IGeoIP2DatabaseReader _cityDb;
		private readonly IGeoIP2DatabaseReader _asnDb;

		public MaxMind(IOptions<AppConfig> config)
		{
			_cityDb = new DatabaseReader(config.Value.MaxMindCityPath);
			_asnDb = new DatabaseReader(config.Value.MaxMindAsnPath);
		}

		/// <summary>
		/// Tries to get the city for the given IP
		/// </summary>
		/// <param name="ip">IP</param>
		/// <returns>City, or <c>null</c> if no data available</returns>
		public CityResponse? City(IPAddress ip)
		{
			_cityDb.TryCity(ip, out var response);
			return response;
		}

		/// <summary>
		/// Tries to get the ASN for the given IP
		/// </summary>
		/// <param name="ip">IP</param>
		/// <returns>ASN, or <c>null</c> if no data available</returns>
		public AsnResponse? Asn(IPAddress ip)
		{
			_asnDb.TryAsn(ip, out var asn);
			return asn;
		}
	}
}

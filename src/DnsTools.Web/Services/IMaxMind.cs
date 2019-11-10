using System.Net;
using MaxMind.GeoIP2.Responses;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Wrapper around MaxMind GeoIP database
	/// </summary>
	public interface IMaxMind
	{
		/// <summary>
		/// Tries to get the city for the given IP
		/// </summary>
		/// <param name="ip">IP</param>
		/// <returns>City, or <c>null</c> if no data available</returns>
		CityResponse? City(IPAddress ip);

		/// <summary>
		/// Tries to get the ASN for the given IP
		/// </summary>
		/// <param name="ip">IP</param>
		/// <returns>ASN, or <c>null</c> if no data available</returns>
		AsnResponse? Asn(IPAddress ip);
	}
}

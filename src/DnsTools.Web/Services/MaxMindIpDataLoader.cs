using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Models;
using DnsTools.Web.Models.Config;
using MaxMind.GeoIP2;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Wrapper around MaxMindIpDataLoader GeoIP database
	/// </summary>
	public class MaxMindIpDataLoader : IIpDataLoader
	{
		private readonly IGeoIP2DatabaseReader _cityDb;
		private readonly IGeoIP2DatabaseReader _asnDb;

		public MaxMindIpDataLoader(IOptions<AppConfig> config)
		{
			_cityDb = new DatabaseReader(config.Value.MaxMindCityPath);
			_asnDb = new DatabaseReader(config.Value.MaxMindAsnPath);
		}

		public ValueTask<IpData?> LoadIpData(IPAddress ip)
		{
			_cityDb.TryCity(ip, out var cityResponse);
			_asnDb.TryAsn(ip, out var asnResponse);

			if (cityResponse == null && asnResponse == null)
			{
				return new ValueTask<IpData?>(result: null);
			}

			return new ValueTask<IpData?>(new IpData
			{
				Asn = asnResponse?.AutonomousSystemNumber,
				AsnName = asnResponse?.AutonomousSystemOrganization,
				City = cityResponse?.City?.Name,
				Country = cityResponse?.Country?.Name,
				CountryIso = cityResponse?.Country?.IsoCode
			});
		}
	}
}

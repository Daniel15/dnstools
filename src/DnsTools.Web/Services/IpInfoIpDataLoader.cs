using System;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DnsTools.Web.Models;
using DnsTools.Web.Models.Config;
using DnsTools.Worker.Extensions;
using IPinfo;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Services
{
	/// <summary>
	/// Loads IP data from ipinfo.io
	/// </summary>
	public class IpInfoIpDataLoader : IIpDataLoader
	{
		private readonly IPinfoClient _client;
		private readonly Regex _asnRegex = new Regex(@"^AS(?<number>\d+) (?<name>.+)$", RegexOptions.Compiled);

		public IpInfoIpDataLoader(IOptions<AppConfig> config)
		{
			_client = new IPinfoClient.Builder()
				.AccessToken(config.Value.IpInfoAccessToken)
				.Build();
		}
		public async ValueTask<IpData?> LoadIpData(IPAddress ip)
		{
			var response = await _client.IPApi.GetDetailsAsync(ip.ToString());
			var asnMatch = _asnRegex.Match(response.Org);
			long? asnNumber = null;
			string? asnName = null;
			if (asnMatch.Success)
			{
				asnNumber = long.Parse(asnMatch.Groups["number"].ToString());
				asnName = asnMatch.Groups["name"].ToString();
			}

			return new IpData
			{
				Asn = asnNumber,
				AsnName = asnName,
				City = response.City,
				Country = response.CountryName,
				CountryIso = response.Country,
				HostName = response.Hostname
			};
		}
	}
}

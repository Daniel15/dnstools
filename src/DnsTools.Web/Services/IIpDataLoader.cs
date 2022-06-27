using System.Net;
using System.Threading.Tasks;
using DnsTools.Web.Models;

namespace DnsTools.Web.Services;

public interface IIpDataLoader
{
	ValueTask<IpData?> LoadIpData(IPAddress ip);
}


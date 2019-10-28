using System.Threading.Tasks;
using DnsTools.Worker;

namespace DnsTools.Web.Hubs
{
	public interface IToolsHub
	{
		Task HelloResponse(string message);
	}
}

using System.Linq;
using DnsTools.Web.Models.Config;
using DnsTools.Web.Services;
using DnsTools.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Controllers
{
	public class HomeController : Controller
	{
		private readonly IWorkerProvider _workerProvider;
		private readonly AppConfig _config;

		public HomeController(IWorkerProvider workerProvider, IOptions<AppConfig> config)
		{
			_workerProvider = workerProvider;
			_config = config.Value;
		}

		[Route("")]
		public IActionResult Index()
		{
			return RenderIndex();
		}

		// ALL client-side routes must be covered below:

		[Route("/ping/{host}/")]
		public IActionResult Ping(string host)
		{
			return RenderIndex($"Ping {host}");
		}

		[Route("/traceroute/{host}/")]
		public IActionResult Traceroute(string host)
		{
			return RenderIndex($"Traceroute to {host}");
		}

		[Route("/lookup/{host}/{type}/")]
		public IActionResult Lookup(string host)
		{
			return RenderIndex($"DNS Lookup for {host}");
		}

		[Route("/traversal/{host}/{type}/")]
		public IActionResult Traversal(string host)
		{
			return RenderIndex($"DNS Traversal for {host}");
		}

		[Route("/whois/{host}/")]
		public IActionResult Whois(string host)
		{
			return RenderIndex($"WHOIS for {host}");
		}

		private IActionResult RenderIndex(string? title = null)
		{
			var model = new IndexViewModel
			{
				WorkerCount = _workerProvider.GetWorkerConfigs().Count(),
			};
			if (title != null)
			{
				model.Title = title;
			}
			return View("Index", model);
		}
	}
}

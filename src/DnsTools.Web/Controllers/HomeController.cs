using DnsTools.Web.Services;
using DnsTools.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace DnsTools.Web.Controllers
{
	public class HomeController : Controller
	{
		private readonly IHttp2PushManifestHandler _pushManifest;

		public HomeController(IHttp2PushManifestHandler pushManifest)
		{
			_pushManifest = pushManifest;
		}

		[Route("")]
		public IActionResult Index()
		{
			_pushManifest.SendHeaders("/", Response);
			return View("~/Views/React/Index.cshtml");
		}

		// ALL client-side routes must be covered below:

		[Route("/ping/{host}/")]
		[Route("/{worker}/ping/{host}/")]
		public IActionResult Ping(string host)
		{
			return RenderNonPreRenderedPage($"Ping {host}");
		}

		[Route("/traceroute/{host}/")]
		public IActionResult Traceroute(string host)
		{
			return RenderNonPreRenderedPage($"Traceroute to {host}");
		}

		[Route("/lookup/{host}/{type}/")]
		public IActionResult Lookup(string host)
		{
			return RenderNonPreRenderedPage($"DNS Lookup for {host}");
		}

		[Route("/traversal/{host}/{type}/")]
		public IActionResult Traversal(string host)
		{
			return RenderNonPreRenderedPage($"DNS Traversal for {host}");
		}

		[Route("/whois/{host}/")]
		public IActionResult Whois(string host)
		{
			return RenderNonPreRenderedPage($"WHOIS for {host}");
		}

		[Route("/{worker}/mtr/{host}/")]
		public IActionResult Mtr(string host)
		{
			return RenderNonPreRenderedPage($"MTR for {host}");
		}

		[Route("/locations/")]
		public IActionResult Locations()
		{
			_pushManifest.SendHeaders("/locations/", Response);
			return View("~/Views/React/Locations.cshtml");
		}

		private IActionResult RenderNonPreRenderedPage(string title)
		{
			_pushManifest.SendHeaders("/", Response);
			return View("~/Views/React/200.cshtml", new IndexViewModel
			{
				Title = title,
			});
		}
	}
}

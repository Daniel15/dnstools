using DnsTools.Web.Models.Config;
using DnsTools.Web.Services;
using DnsTools.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace DnsTools.Web.Controllers
{
	public class HomeController : Controller
	{
		[Route("")]
		// Must match routes in JS
		[Route("/ping/{host}")]
		[Route("/traceroute/{host}")]
		public IActionResult Index([FromServices] IWorkerProvider workerProvider)
		{
			var workers = workerProvider.GetWorkerConfigs();
			return View(new IndexViewModel
			{
				Config = new FrontEndConfig
				{
					Workers = workers,
				}
			});
		}
	}
}

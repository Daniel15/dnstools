using System.Diagnostics;
using DnsTools.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace DnsTools.Web.Controllers
{
	[Route("/Error/[action]", Order = 1)]
	public class ErrorController : Controller
	{
		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		[Route("/Error/Error")]
		[Route("/Error/Status{code:int}", Order = 2)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}

		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Status404()
		{
			return View("~/Views/React/404.cshtml");
		}
	}
}

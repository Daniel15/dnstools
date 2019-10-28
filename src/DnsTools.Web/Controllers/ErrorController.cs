using System.Diagnostics;
using DnsTools.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace DnsTools.Web.Controllers
{
	public class ErrorController : Controller
	{
		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}
	}
}

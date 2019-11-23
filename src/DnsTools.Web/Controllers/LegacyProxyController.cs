using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace DnsTools.Web.Controllers
{
	public class LegacyProxyController : Controller
	{
		private readonly IWebHostEnvironment _env;
		private readonly IHttpClientFactory _clientFactory;

		public LegacyProxyController(IWebHostEnvironment env, IHttpClientFactory clientFactory)
		{
			_env = env;
			_clientFactory = clientFactory;
		}

		[Route("/legacy/{*path}")]
		public async Task<IActionResult> Invoke(string path)
		{
			var baseUri = new Uri(_env.IsDevelopment()
				? "http://legacy.dnstools.test/"
				: "https://legacy.dnstools.ws/");

			var uri = new Uri(baseUri, path);
			return Content(await _clientFactory.CreateClient().GetStringAsync(uri));
		}
	}
}

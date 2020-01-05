using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using DnsTools.Web.Utils;
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

		[Route("/data/whois/{host}/")]
		public async Task<IActionResult> Whois(string host, [FromServices]ICaptcha captcha)
		{
			if (!captcha.IsValidatedInSession())
			{
				return Content("SHOW-CAPTCHA");
			}

			// This should be rewritten in C# one day, but for now we just proxy to the PHP version.
			var msg = new HttpRequestMessage(
				HttpMethod.Post,
				_env.IsDevelopment() ? "http://127.0.0.1/whois.php" : "http://127.0.0.1/legacy/whois.php"
			);
			msg.Headers.Add("Host", _env.IsDevelopment() ? "legacy.dnstools.test" : HttpContext.Request.Host.Host);
			msg.Content = new FormUrlEncodedContent(new Dictionary<string, string>
			{
				{"host", host}
			});

			var response = await _clientFactory.CreateClient().SendAsync(msg, HttpContext.RequestAborted);
			return Content(await response.Content.ReadAsStringAsync());
		}
	}
}

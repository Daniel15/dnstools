using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using DnsTools.Web.Models;
using DnsTools.Web.Models.Config;
using DnsTools.Web.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DnsTools.Web.Controllers
{
	public class CaptchaController : Controller
	{
		private readonly IHttpClientFactory _clientFactory;
		private readonly ICaptcha _captcha;
		private readonly AppConfig _config;

		public CaptchaController(IHttpClientFactory clientFactory, IOptions<AppConfig> config, ICaptcha captcha)
		{
			_clientFactory = clientFactory;
			_captcha = captcha;
			_config = config.Value;
		}

		[HttpPost("/captcha")]
		public async Task<CaptchaResponse> Invoke(string response)
		{
			try
			{
				var client = _clientFactory.CreateClient();
				var httpResult = await client.PostAsync(
					"https://www.google.com/recaptcha/api/siteverify",
					new FormUrlEncodedContent(new Dictionary<string, string>
					{
						{"secret", _config.ReCaptcha.SecretKey},
						{"response", response},
						{"remoteip", HttpContext.Connection.RemoteIpAddress?.ToString() ?? ""},
					})
				);
				var resultBody = await httpResult.EnsureSuccessStatusCode().Content.ReadAsStringAsync();
				var result = JsonSerializer.Deserialize<ReCaptchaVerifyResponse>(resultBody, new JsonSerializerOptions
				{
					PropertyNameCaseInsensitive = true
				});

				if (!result.Success)
				{
					return new CaptchaResponse
					{
						Success = false,
						Error = string.Join(", ", result.ErrorCodes),
					};
				}

				_captcha.MarkValidInSession();
				return new CaptchaResponse
				{
					Success = true
				};
			}
			catch (Exception ex)
			{
				return new CaptchaResponse
				{
					Success = false,
					Error = ex.Message,
				};
			}
		}
	}
}

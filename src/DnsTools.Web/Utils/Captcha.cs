using Microsoft.AspNetCore.Http;

namespace DnsTools.Web.Utils
{
	public class Captcha : ICaptcha
	{
		private const string SESSION_FIELD = "captcha";

		private readonly IHttpContextAccessor _httpContextAccessor;

		public Captcha(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		public bool IsValidatedInSession()
		{
			return _httpContextAccessor.HttpContext.Session.GetInt32(SESSION_FIELD) == 1;
		}

		public void MarkValidInSession()
		{
			_httpContextAccessor.HttpContext.Session.SetInt32(SESSION_FIELD, 1);
		}
	}
}

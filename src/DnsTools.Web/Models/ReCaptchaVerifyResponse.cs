using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DnsTools.Web.Models
{
	/// <summary>
	/// Response from ReCAPTCHA API.
	/// https://developers.google.com/recaptcha/docs/verify
	/// </summary>
	public class ReCaptchaVerifyResponse
	{
		public bool Success { get; set; } = false;

		[JsonPropertyName("error-codes")]
		public IEnumerable<string> ErrorCodes { get; set; } = new string[]{};
	}
}

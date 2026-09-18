using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CliWrap;
using DnsTools.Web.Utils;
using DnsTools.Worker.Utils;
using Microsoft.AspNetCore.Mvc;
using Sentry;
using Whois;

namespace DnsTools.Web.Controllers;

public class WhoisController : Controller
{
	private readonly IWhoisLookup _whois;

	public WhoisController(IWhoisLookup whois)
	{
		_whois = whois;
	}
	[Route("/data/whois/{host}/{protocol?}")]
	public async Task<IActionResult> Whois(
		string host,
		ProtocolPreference? protocol,
		[FromServices]ICaptcha captcha,
		CancellationToken cancellationToken
	)
	{
		if (!captcha.IsValidatedInSession())
		{
			return Content("SHOW-CAPTCHA");
		}
		
		protocol ??= ProtocolPreference.Auto;
		Hostname.AssertValid(host);
		
		try
		{
			var result = await _whois.Lookup(new WhoisRequest(host)
			{
				PreferredProtocol = protocol
			}, cancellationToken);
			return PartialView("StructuredWhois", result);
		}
		catch (Exception ex)
		{
			SentrySdk.CaptureException(ex, scope =>
			{
				scope.SetExtra("host", host);
			});
			
			var shouldFallbackToWhois = protocol is ProtocolPreference.Auto or ProtocolPreference.Whois;
			if (shouldFallbackToWhois)
			{
				try
				{
					var output = new StringBuilder();
					await Cli.Wrap("whois")
						.WithArguments(["-H", host])
						.WithStandardOutputPipe(PipeTarget.ToStringBuilder(output))
						.WithStandardErrorPipe(PipeTarget.ToStringBuilder(output))
						.ExecuteAsync(cancellationToken);

					return PartialView("RawWhois", output.ToString());
				}
				catch (Exception)
				{
					// Ignore - fall through to outer error handling.
				}
			}

			return Content($"ERROR: {ex.Message}");
		}
	}
}

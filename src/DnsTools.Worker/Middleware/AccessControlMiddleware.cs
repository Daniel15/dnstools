using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DnsTools.Worker.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NetTools;

namespace DnsTools.Worker.Middleware
{
	public class AccessControlMiddleware
	{
		private readonly RequestDelegate _next;
		private readonly ILogger<AccessControlMiddleware> _logger;
		private readonly IList<IPAddressRange> _allowedIps;

		public AccessControlMiddleware(
			RequestDelegate next,
			IOptions<AccessControlConfig> config,
			ILogger<AccessControlMiddleware> logger
		)
		{
			_next = next;
			_logger = logger;
			_allowedIps = config.Value.AllowedIps.Select(IPAddressRange.Parse).ToImmutableList();
		}

		public Task Invoke(HttpContext httpContext)
		{
			var ip = httpContext.Connection.RemoteIpAddress;
			if (ip.IsIPv4MappedToIPv6)
			{
				ip = ip.MapToIPv4();
			}

			return IsAllowed(ip) ? _next(httpContext) : DenyAccess(httpContext, ip);
		}

		private bool IsAllowed(IPAddress ip)
		{
			if (_allowedIps.Count == 0)
			{
				return true;
			}

			return _allowedIps.Any(x => x.Contains(ip));
		}

		private async Task DenyAccess(HttpContext httpContext, IPAddress ip)
		{
			_logger.LogInformation("Denied access to IP {0}", ip);
			httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
			await httpContext.Response.WriteAsync($"Access denied ({ip})");
		}
	}

	public static class AccessControlMiddlewareExtensions
	{
		public static IApplicationBuilder UseAccessControlMiddleware(this IApplicationBuilder builder)
		{
			return builder.UseMiddleware<AccessControlMiddleware>();
		}
	}
}

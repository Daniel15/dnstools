using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using DnsTools.Web.Models.Config;
using Microsoft.AspNetCore.Html;

namespace DnsTools.Web.ViewModels
{
	public class IndexViewModel
	{
		public string Title { get; set; } = "Welcome to DNSTools!";

		public FrontEndConfig Config { get; set; } = default!;

		public HtmlString ConfigJson =>
			new HtmlString(JsonSerializer.Serialize(Config, new JsonSerializerOptions
			{
				PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
			}));
	}
}

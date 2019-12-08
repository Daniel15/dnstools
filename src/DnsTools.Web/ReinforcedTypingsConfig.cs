using DnsTools.Web.Extensions;
using DnsTools.Worker;
using Reinforced.Typings.Attributes;
using Reinforced.Typings.Fluent;

[assembly: TsGlobal(
	CamelCaseForMethods = true,
	CamelCaseForProperties = true,
	DiscardNamespacesWhenUsingModules = true,
	UseModules = true,
	GenerateDocumentation = true,
	ReorderMembers = true
)]

namespace DnsTools.Web
{
	public static class ReinforcedTypingsConfig
	{
		public static void Configure(ConfigurationBuilder builder)
		{
			builder.ExportAsInterface<PingRequest>().WithPublicInstanceProperties();
			builder.ExportAsInterface<PingReply>().WithPublicInstanceProperties();
			builder.ExportAsInterface<PingTimeout>().WithPublicInstanceProperties();
			builder.ExportAsInterface<PingSummary>().WithPublicInstanceProperties();
			builder.ExportAsInterface<HostLookupResult>().WithPublicInstanceProperties();

			builder.ExportAsInterface<TracerouteRequest>().WithPublicInstanceProperties();
			builder.ExportAsInterface<TracerouteReply>().WithPublicInstanceProperties();

			builder.ExportAsEnum<PingResponse.ResponseOneofCase>().OverrideName("PingResponseType");
			builder.ExportAsEnum<TracerouteResponse.ResponseOneofCase>().OverrideName("TracerouteResponseType");

			builder.ExportAsInterface<Error>().WithPublicInstanceProperties();

			builder.ExportAsEnum<Protocol>();
			builder.ExportAsEnum<DnsLookupType>();
		}
	}
}

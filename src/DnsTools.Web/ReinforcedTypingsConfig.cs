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

			builder.ExportAsEnum<PingResponse.ResponseOneofCase>().OverrideName("PingResponseType");

			builder.ExportAsInterface<Error>().WithPublicInstanceProperties();

			builder.ExportAsEnum<Protocol>();
		}
	}
}
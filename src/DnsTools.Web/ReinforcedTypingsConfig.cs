﻿using DnsTools.Web.Extensions;
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
			builder.ExportAsInterface<PingReply>().WithPublicInstanceProperties();
			builder.ExportAsInterface<PingTimeout>().WithPublicInstanceProperties();
			builder.ExportAsInterface<PingSummary>().WithPublicInstanceProperties();
			builder.ExportAsInterface<HostLookupResult>().WithPublicInstanceProperties();

			builder.ExportAsInterface<TracerouteReply>().WithPublicInstanceProperties();

			builder.ExportAsInterface<DnsLookupReferral>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsLookupRetry>().WithPublicInstanceProperties().AutoI(false);
			builder.ExportAsInterface<DnsARecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsAAAARecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsCAARecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsCNAMERecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsMXRecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsNSRecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsPTRRecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsSOARecord>().WithPublicInstanceProperties();
			builder.ExportAsInterface<DnsTXTRecord>().WithPublicInstanceProperties();

			builder.ExportAsInterface<MtrHostLine>().WithPublicInstanceProperties().AutoI(false);
			builder.ExportAsInterface<MtrTransmitLine>().WithPublicInstanceProperties().AutoI(false);
			builder.ExportAsInterface<MtrPingLine>().WithPublicInstanceProperties().AutoI(false);
			builder.ExportAsInterface<MtrDnsLine>().WithPublicInstanceProperties().AutoI(false);

			builder.ExportAsEnum<PingResponse.ResponseOneofCase>().OverrideName("PingResponseType");
			builder.ExportAsEnum<TracerouteResponse.ResponseOneofCase>().OverrideName("TracerouteResponseType");
			builder.ExportAsEnum<DnsLookupResponse.ResponseOneofCase>().OverrideName("DnsLookupResponseType");
			builder.ExportAsEnum<DnsTraversalResponse.ResponseOneofCase>().OverrideName("DnsTraversalResponseType");
			builder.ExportAsEnum<DnsRecord.RecordOneofCase>().OverrideName("DnsRecordType");
			builder.ExportAsEnum<MtrResponse.ResponseOneofCase>().OverrideName("MtrResponseType");

			builder.ExportAsInterface<Error>().WithPublicInstanceProperties();

			builder.ExportAsEnum<Protocol>();
			builder.ExportAsEnum<DnsLookupType>();
		}
	}
}

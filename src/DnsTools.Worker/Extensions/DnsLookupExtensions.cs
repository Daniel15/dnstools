using System;
using System.Collections.Generic;
using System.Linq;
using DnsClient;
using DnsClient.Protocol;

namespace DnsTools.Worker.Extensions
{
	/// <summary>
	/// Extension methods for DnsClient.NET
	/// </summary>
	public static class DnsLookupExtensions
	{
		/// <summary>
		/// Converts a DnsClient.NET lookup type to our QueryType.
		/// </summary>
		public static QueryType ToQueryType(this DnsLookupType type)
		{
			switch (type)
			{
				case DnsLookupType.A:
					return QueryType.A;

				case DnsLookupType.Aaaa:
					return QueryType.AAAA;

				case DnsLookupType.Caa:
					return QueryType.CAA;

				case DnsLookupType.Cname:
					return QueryType.CNAME;

				case DnsLookupType.Mx:
					return QueryType.MX;

				case DnsLookupType.Ns:
					return QueryType.NS;

				case DnsLookupType.Ptr:
					return QueryType.PTR;

				case DnsLookupType.Soa:
					return QueryType.SOA;

				case DnsLookupType.Txt:
					return QueryType.TXT;

				default:
					throw new ArgumentOutOfRangeException(nameof(type), type, null);
			}
		}

		/// <summary>
		/// Converts a DnsClient.NET record to our Protobuf record type.
		/// </summary>
		public static DnsRecord? ToRecord(this DnsResourceRecord input)
		{
			var output = new DnsRecord
			{
				Name = input.DomainName.Value.TrimEnd('.'),
				Ttl = input.InitialTimeToLive,
			};

			switch (input)
			{
				case ARecord a:
					output.A = new DnsARecord
					{
						Address = a.Address.ToString()
					};
					break;

				case AaaaRecord aaaa:
					output.Aaaa = new DnsAAAARecord
					{
						Address = aaaa.Address.ToString()
					};
					break;

				case CaaRecord caa:
					output.Caa = new DnsCAARecord
					{
						Value = caa.Value
					};
					break;

				case CNameRecord cname:
					output.Cname = new DnsCNAMERecord
					{
						Cname = cname.CanonicalName.ToString().TrimEnd('.')
					};
					break;

				case MxRecord mx:
					output.Mx = new DnsMXRecord
					{
						Exchange = mx.Exchange.ToString().TrimEnd('.'),
						Preference = mx.Preference,
					};
					break;

				case NsRecord ns:
					output.Ns = new DnsNSRecord
					{
						Nsdname = ns.NSDName.Value.TrimEnd('.')
					};
					break;

				case PtrRecord ptr:
					output.Ptr = new DnsPTRRecord
					{
						Ptrdname = ptr.PtrDomainName.Value
					};
					break;

				case SoaRecord soa:
					output.Soa = new DnsSOARecord
					{
						Expire = soa.Expire,
						Minimum = soa.Minimum,
						Mname = soa.MName.Value,
						Refresh = soa.Refresh,
						Retry = soa.Retry,
						Rname = soa.RName.Value,
						Serial = soa.Serial
					};
					break;

				case TxtRecord txt:
					output.Txt = new DnsTXTRecord
					{
						// TODO: This should probably return individual records
						Text = string.Join("\n", txt.Text)
					};
					break;

				default:
					return null;
			}

			return output;
		}

		/// <summary>
		/// Gets a string to sort records by.
		/// </summary>
		private static string SortKey(DnsResourceRecord record)
		{
			switch (record)
			{
				case ARecord a:
					return $"{a.DomainName}-{a.Address}";

				case AaaaRecord aaaa:
					return $"{aaaa.DomainName}-{aaaa.Address}";

				case CaaRecord caa:
					return $"{caa.DomainName}-{caa.Value}";

				case CNameRecord cname:
					return $"{cname.DomainName}-{cname.CanonicalName}";

				case MxRecord mx:
					return $"{mx.DomainName}-{mx.Preference}-{mx.Exchange}";

				case NsRecord ns:
					return $"{ns.DomainName}-{ns.NSDName}";

				case PtrRecord ptr:
					return $"{ptr.DomainName}-{ptr.PtrDomainName}";

				case TxtRecord txt:
					return $"{txt.DomainName}-{txt.Text}";

				default:
					return record.DomainName;
			}
		}

		/// <summary>
		/// Converts a collection of DnsClient.net records into our Protobuf record type
		/// </summary>
		public static IEnumerable<DnsRecord> ToRecords(this IEnumerable<DnsResourceRecord> input)
		{
			return input
				.OrderBy(SortKey)
				.Select(x => x.ToRecord())
				// Filter out nulls
				.Where(x => x != null)
				.Select(x => x!);
		}

		/// <summary>
		/// Converts a DnsClient.NET query response into our Protobuf query response record type
		/// </summary>
		public static DnsLookupReply ToReply(this IDnsQueryResponse response)
		{
			return new DnsLookupReply
			{
				Answers = { response.Answers.ToRecords() },
				Authorities = { response.Authorities.ToRecords() },
				Additionals = { response.Additionals.ToRecords() },
				From = response.NameServer.Endpoint.Address.ToString(),
			};
		}
	}
}

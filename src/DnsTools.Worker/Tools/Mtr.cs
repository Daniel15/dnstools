using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DnsTools.Worker.Utils;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Wraps <c>mtr</c> CLI
	/// </summary>
	public class Mtr : BaseCliTool<TracerouteRequest, MtrResponse>
	{
		private const float US_PER_MS = 1000;
		
		protected override string GetCommand(TracerouteRequest request) => "mtr";

		protected override async Task<IReadOnlyList<string>> GetArguments(
			TracerouteRequest request,
			IServerStreamWriter<MtrResponse> writer
		)
		{
			var ip = await Hostname.GetIp(request.Host, request.Protocol);
			var ipString = ip.ToString();
			await writer.WriteAsync(new MtrResponse
			{
				Lookup = new HostLookupResult
				{
					Ip = ipString
				}
			});

			return new List<string> { "--no-dns", "--raw", "--report-cycles", "100", ipString };
		}

		protected override MtrResponse? ParseResponse(string data)
		{
			// Reference: https://github.com/traviscross/mtr/blob/master/FORMATS
			var pieces = data.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
			return pieces[0] switch
			{
				"d" => new MtrResponse
				{
					Pos = uint.Parse(pieces[1]), 
					Dns = new MtrDnsLine
					{
						Hostname = pieces[2],
					}
				},
				
				"h" => new MtrResponse
				{
					Pos = uint.Parse(pieces[1]), 
					Host = new MtrHostLine
					{
						Ip = pieces[2],
					}
				},
				
				"p" => new MtrResponse
				{
					Pos = uint.Parse(pieces[1]),
					Ping = new MtrPingLine
					{
						Rtt = float.Parse(pieces[2]) / US_PER_MS,
						Seqnum = uint.Parse(pieces[3]),
					}
				},
				
				"x" => new MtrResponse
				{
					Pos = uint.Parse(pieces[1]), 
					Transmit = new MtrTransmitLine
					{
						Seqnum = uint.Parse(pieces[2]),
					}
				},
				
				_ => new MtrResponse
				{
					Error = new Error
					{
						Message = $"Unknown reply: {data}"
					}
				}
			};
		}
	}
}

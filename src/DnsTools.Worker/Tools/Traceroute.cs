using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DnsTools.Worker.Utils;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Wraps traceroute CLI
	/// </summary>
	public class Traceroute : BaseCliTool<TracerouteRequest, TracerouteResponse>
	{
		protected override string GetCommand(TracerouteRequest request) => "traceroute";

		protected override async Task<IReadOnlyList<string>> GetArguments(
			TracerouteRequest request,
			IServerStreamWriter<TracerouteResponse> writer
		)
		{
			var ip = await Hostname.GetIp(request.Host, request.Protocol);
			var ipString = ip.ToString();
			await writer.WriteAsync(new TracerouteResponse
			{
				Lookup = new HostLookupResult
				{
					Ip = ipString
				}
			});

			return new List<string> {"-n", "-q 1", ipString };
		}

		protected override TracerouteResponse ParseResponse(string data)
		{
			// Ignore header
			if (data.StartsWith("traceroute to"))
			{
				return null;
			}

			var pieces = data.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
			var seq = int.Parse(pieces[0]);
			if (pieces.Length >= 2 && pieces[1] == "*")
			{
				return new TracerouteResponse
				{
					Timeout = new PingTimeout
					{
						Seq = seq,
					},
				};
			}

			if (pieces.Length >= 3)
			{
				return new TracerouteResponse
				{
					Reply = new TracerouteReply
					{
						Ip = pieces[1],
						Seq = seq,
						Rtt = float.Parse(pieces[2]),
					}
				};
			}

			return new TracerouteResponse
			{
				Error = new Error
				{
					Message = $"Unknown reply: {data}",
				},
			};
		}
	}
}

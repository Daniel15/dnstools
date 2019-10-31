using System;
using System.Collections.Generic;
using DnsTools.Worker.Utils;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Wraps traceroute CLI
	/// </summary>
	public class Traceroute : BaseCliTool<TracerouteRequest, TracerouteResponse>
	{
		protected override string GetCommand(TracerouteRequest request) => "traceroute";

		protected override IReadOnlyList<string> GetArguments(TracerouteRequest request)
		{
			Hostname.AssertValid(request.Host);
			var args = new List<string> {"-n", "-q 1", request.Host};
			switch (request.Protocol)
			{
				case Protocol.Any:
					break;

				case Protocol.Ipv4:
					args.Add("-4");
					break;

				case Protocol.Ipv6:
					args.Add("-6");
					break;

				default:
					throw new ArgumentOutOfRangeException();
			}

			return args;
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
						RawReply = data,
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

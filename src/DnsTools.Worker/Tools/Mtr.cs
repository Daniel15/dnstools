using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.JavaScript;
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

		private readonly Dictionary<uint, HashSet<string>> _hostIPsAlreadySent = new();

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

			if (pieces[0] == "h")
			{
				var pos = uint.Parse(pieces[1]);
				var ip = pieces[2];
				return CheckIfHostIsDuplicate(pos, ip) ? null : new MtrResponse
				{
					Pos = uint.Parse(pieces[1]),
					Host = new MtrHostLine
					{
						Ip = pieces[2],
					}
				};
			}

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

		/// <summary>
		/// Checks if this host line has already been returned during this session, to avoid returning
		/// duplicates to the client-side.
		/// </summary>
		/// <see>https://github.com/traviscross/mtr/issues/499</see>
		/// <returns><c>true</c> if this host has already been returned, otherwise <c>false</c></returns>
		private bool CheckIfHostIsDuplicate(uint pos, string ip)
		{
			var ipsAlreadySentForPos = _hostIPsAlreadySent.GetValueOrDefault(pos);
			if (ipsAlreadySentForPos == null)
			{
				ipsAlreadySentForPos = new HashSet<string>();
				_hostIPsAlreadySent.Add(pos, ipsAlreadySentForPos);
			}

			return !ipsAlreadySentForPos.Add(ip);
		}
	}
}

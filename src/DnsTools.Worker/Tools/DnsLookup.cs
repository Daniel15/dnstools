using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using DnsClient;
using DnsTools.Worker.Extensions;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	public class DnsLookup : ITool<DnsLookupRequest, DnsLookupResponse>
	{
		private static readonly IReadOnlyList<string> _rootServers = new List<string>
		{
			"a.root-servers.net",
			"b.root-servers.net",
			"c.root-servers.net",
			"d.root-servers.net",
			"e.root-servers.net",
			"f.root-servers.net",
			"g.root-servers.net",
			"h.root-servers.net",
			"i.root-servers.net",
			"j.root-servers.net",
			"k.root-servers.net",
			"l.root-servers.net",
			"m.root-servers.net",
		}.ToImmutableList();

		/// <summary>
		/// Runs the tool
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <param name="responseStream">Stream to write responses to</param>
		/// <param name="cancellationToken">Cancellation token for if user cancels the request</param>
		public async Task RunAsync(
			DnsLookupRequest request, 
			IServerStreamWriter<DnsLookupResponse> responseStream, 
			CancellationToken cancellationToken
		)
		{
			var serverName = _rootServers.Random();
			var serverIp = (await Dns.GetHostAddressesAsync(serverName)).First();
			await responseStream.WriteAsync(new DnsLookupResponse
			{
				Referral = new DnsLookupReferral
				{
					NextServerName = serverName,
					NextServerIp = serverIp.ToString(),
				}
			});
			await DoLookup(request, responseStream, cancellationToken, serverName, serverIp);
		}

		private async Task DoLookup(
			DnsLookupRequest request,
			IServerStreamWriter<DnsLookupResponse> responseStream,
			CancellationToken cancellationToken,
			string serverName,
			IPAddress serverIp
		)
		{
			var client = new LookupClient(serverIp, 53)
			{
				UseCache = false,
				ThrowDnsErrors = true,
			};
			IDnsQueryResponse response;
			var stopwatch = new Stopwatch();
			stopwatch.Start();
			try
			{
				response = await client.QueryAsync(
					request.Host,
					request.Type.ToQueryType(),
					cancellationToken: cancellationToken
				);
				stopwatch.Stop();
			}
			catch (Exception ex)
			{
				stopwatch.Stop();
				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Error = new Error
					{
						Title = $"Failed: {ex.Message}",
						Message = $"There is a problem with the DNS server at {serverName}",
					},
				});
				return;
			}

			// DNS server was authoritive and no results exist
			if (response.Header.HasAuthorityAnswer && response.Answers.Count == 0)
			{
				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Error = new Error
					{
						Title = "Failed: No results",
						Message = "This DNS record does not exist",
					},
				});
				return;
			}

			// Was this server non-authoritive?
			if (response.Answers.Count == 0)
			{
				// Let's check who's in charge.
				// Randomly pick one of the authoritive servers
				var newServer = response.Authorities.NsRecords().Random();

				// See if glue was provided with an IP
				var newServerIp = response.Additionals.ARecords()
					.FirstOrDefault(x => x.DomainName.Value == newServer.NSDName.Value)
					?.Address;

				if (newServerIp == null)
				{
					newServerIp = response.Additionals.AaaaRecords()
						.FirstOrDefault(x => x.DomainName.Value == newServer.NSDName.Value)
						?.Address;
				}

				if (newServerIp == null)
				{
					// No glue, so we need to look up the server IP
					newServerIp = (await Dns.GetHostAddressesAsync(newServer.NSDName.Value)).First();
				}

				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Referral = new DnsLookupReferral
					{
						PrevServerName = serverName,
						PrevServerIp = serverIp.ToString(),
						NextServerName = newServer.NSDName.Value.TrimEnd('.'),
						NextServerIp = newServerIp?.ToString() ?? "",
						Reply = response.ToReply(),
					}
				});
				await DoLookup(request, responseStream, cancellationToken, newServer.NSDName.Value, newServerIp);
				return;
			}

			// It *was* authoritive.
			await responseStream.WriteAsync(new DnsLookupResponse
			{
				Duration = (uint)stopwatch.ElapsedMilliseconds,
				Reply = response.ToReply()
			});
		}
	}
}

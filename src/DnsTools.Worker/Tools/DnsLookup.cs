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
using Google.Protobuf.Collections;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	public class DnsLookup : ITool<DnsLookupRequest, DnsLookupResponse>
	{
		private static readonly TimeSpan _timeout = TimeSpan.FromSeconds(3);
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
			var serverIps = await Dns.GetHostAddressesAsync(serverName);
			await responseStream.WriteAsync(new DnsLookupResponse
			{
				Referral = new DnsLookupReferral
				{
					NextServerName = serverName,
					NextServerIps = {serverIps.Select(x => x.ToString())},
				}
			});
			await DoLookup(request, responseStream, cancellationToken, serverName, serverIps);
		}

		private async Task DoLookup(
			DnsLookupRequest request,
			IServerStreamWriter<DnsLookupResponse> responseStream,
			CancellationToken cancellationToken,
			string serverName,
			IEnumerable<IPAddress> serverIps
		)
		{
			var client = new LookupClient(serverIps.ToArray())
			{
				UseCache = false,
				ThrowDnsErrors = true,
				Retries = 0,
				Timeout = _timeout,
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
				var newServerIps = response.Additionals.ARecords()
					.Where(x => x.DomainName.Value == newServer.NSDName.Value)
					.Select(x => x.Address)
					.Concat(
						response.Additionals.AaaaRecords()
							.Where(x => x.DomainName.Value == newServer.NSDName.Value)
							.Select(x => x.Address)
					)
					.ToArray();

				if (newServerIps.Length == 0)
				{
					// No glue, so we need to look up the server IP
					newServerIps = await Dns.GetHostAddressesAsync(newServer.NSDName.Value);
				}

				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Referral = new DnsLookupReferral
					{
						PrevServerName = serverName,
						PrevServerIp = response.NameServer.Endpoint.Address.ToString(),
						NextServerName = newServer.NSDName.Value.TrimEnd('.'),
						NextServerIps = {newServerIps.Select(x => x.ToString())},
						Reply = response.ToReply(),
					}
				});
				await DoLookup(request, responseStream, cancellationToken, newServer.NSDName.Value, newServerIps);
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

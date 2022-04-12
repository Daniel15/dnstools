using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using DnsClient;
using DnsTools.Worker.Exceptions;
using DnsTools.Worker.Extensions;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	public class DnsLookup : BaseDnsLookup, ITool<DnsLookupRequest, DnsLookupResponse>
	{
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
			request.Host = ConvertToArpaNameIfRequired(request);
			await RecurseWithRetries(
				request,
				responseStream,
				cancellationToken,
				prevServerName: null,
				response: null,
				newServers: _rootServers
			);
		}

		/// <summary>
		/// Iterate through all the next DNS servers for a given query. If an exception is thrown,
		/// retries with a different server, until there are no servers left to retry.
		/// </summary>
		/// <returns></returns>
		private async Task RecurseWithRetries(
			DnsLookupRequest request,
			IServerStreamWriter<DnsLookupResponse> responseStream,
			CancellationToken cancellationToken,
			string? prevServerName,
			IDnsQueryResponse? response,
			IEnumerable<string> newServers
		)
		{
			var stopwatch = new Stopwatch();
			var isRetry = false;
			DnsLookupReferral? prevReferral = null;
			DnsLookupRetryableException? prevException = null;
			foreach (var newServer in newServers.Shuffle())
			{
				stopwatch.Restart();
				var newServerIps = await GetDnsServerIPs(newServer, response);

				var referral = new DnsLookupReferral
				{
					PrevServerName = prevServerName ?? string.Empty,
					PrevServerIp = response?.NameServer?.Address ?? string.Empty,
					NextServerName = newServer.TrimEnd('.'),
					NextServerIps = { newServerIps.Select(x => x.ToString()) },
					Reply = response?.ToReply(),
				};

				if (isRetry)
				{
					await responseStream.WriteAsync(new DnsLookupResponse
					{
						Duration = (uint)stopwatch.ElapsedMilliseconds,
						Retry = new DnsLookupRetry
						{
							PrevServerName = prevReferral?.NextServerName ?? string.Empty,
							NextServerName = referral.NextServerName,
							NextServerIps = { referral.NextServerIps },
							Error = prevException?.ToError(),
						}
					});
				}
				else
				{
					await responseStream.WriteAsync(new DnsLookupResponse
					{
						Duration = (uint)stopwatch.ElapsedMilliseconds,
						Referral = referral
					});
				}

				try
				{
					await DoLookup(
						request,
						responseStream,
						cancellationToken,
						newServer,
						newServerIps
					);
					return;
				}
				catch (DnsLookupRetryableException ex)
				{
					isRetry = true;
					prevException = ex;
					prevReferral = referral;
				}
			}

			await responseStream.WriteAsync(new DnsLookupResponse
			{
				Error = new Error
				{
					Title = "No More Servers",
					Message = "Ran out of servers to try!",
				}
			});
		}

		/// <summary>
		/// Performs a DNS lookup and handles authoritative results.
		/// Recursing is handled by <see cref="RecurseWithRetries"/>
		/// </summary>
		private async Task DoLookup(
			DnsLookupRequest request,
			IServerStreamWriter<DnsLookupResponse> responseStream,
			CancellationToken cancellationToken,
			string serverName,
			IEnumerable<IPAddress> serverIps
		)
		{
			var client = new LookupClient(new LookupClientOptions(serverIps.ToArray())
			{
				UseCache = false,
				ThrowDnsErrors = false,
				Retries = 0,
				Timeout = _timeout,
			});
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
				throw new DnsLookupRetryableException(
					elapsedMilliseconds: stopwatch.ElapsedMilliseconds,
					serverName: serverName,
					innerException: ex
				);
			}

			// If we get here, the query worked, but the DNS server might have returned an
			// error response.
			if (response.HasError)
			{
				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Error = response.ToError(serverName)
				});
				return;
			}

			if (response.Answers.Count > 0)
			{
				// It *was* authoritive.
				await responseStream.WriteAsync(new DnsLookupResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Reply = response.ToReply()
				});
				return;
			}

			var authoritativeServers = response.Authorities.NsRecords().Select(record => record.NSDName.Value).ToList();
			if (authoritativeServers.Count > 0)
			{
				await RecurseWithRetries(
					request,
					responseStream,
					cancellationToken,
					serverName,
					response,
					newServers: authoritativeServers
				);
				return;
			}

			// If we got here, it must be NOERROR status with 0 answers and 0 authorities
			// This means the domain exists, but this particular record type does not
			await responseStream.WriteAsync(new DnsLookupResponse
			{
				Duration = (uint) stopwatch.ElapsedMilliseconds,
				Error = new Error
				{
					Title = "Failed: No records",
					Message = "This domain exists, but a record of this type was not found.",
				}
			});
		}
	}
}



/*try
{
	var soaResponse = await client.QueryAsync(
		request.Host,
		QueryType.SOA,
		cancellationToken: cancellationToken
	);
	var soa = soaResponse.Answers.SoaRecords().First();

}
catch (Exception ex)
{
	await responseStream.WriteAsync(new DnsLookupResponse
	{
		Duration = 0,
		Error = new Error
		{
			Title = "Unable to get SOA record",
			Message = ex.Message,
		},
	});
}*/

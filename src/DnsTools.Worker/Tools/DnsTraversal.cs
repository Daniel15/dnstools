using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DnsClient;
using DnsTools.Worker.Extensions;
using DnsTools.Worker.Utils;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	public class DnsTraversal : BaseDnsLookup, ITool<DnsLookupRequest, DnsTraversalResponse>
	{
		/// <summary>
		/// DNS lookups that are currently executing, to ensure we only send one request per DNS server.
		/// Lazy{T} is used to ensure we only hit each server exactly once.
		/// See https://andrewlock.net/making-getoradd-on-concurrentdictionary-thread-safe-using-lazy/
		/// </summary>
		private readonly ConcurrentDictionary<string, Lazy<Task>> _lookupsByServer = new ConcurrentDictionary<string, Lazy<Task>>();

		/// <summary>
		/// Runs the tool
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <param name="responseStream">Stream to write responses to</param>
		/// <param name="cancellationToken">Cancellation token for if user cancels the request</param>
		public async Task RunAsync(
			DnsLookupRequest request,
			IServerStreamWriter<DnsTraversalResponse> responseStream,
			CancellationToken cancellationToken
		)
		{
			var responseQueue = new GrpcStreamResponseQueue<DnsTraversalResponse>(responseStream);
			request.Host = ConvertToArpaNameIfRequired(request);

			await Task.WhenAll(_rootServers.Select(
				async serverName => await DoLookup(
					request,
					responseQueue,
					cancellationToken,
					serverName,
					null,
					1
				)
			));
			await responseQueue.CompleteAsync();
		}

		/// <summary>
		/// Wraps <see cref="DoLookupImpl"/> and ensures each lookup is only performed once, even
		/// if multiple servers return the same referral.
		/// </summary>
		private async Task DoLookup(
			DnsLookupRequest request,
			GrpcStreamResponseQueue<DnsTraversalResponse> responseQueue,
			CancellationToken cancellationToken,
			string serverName,
			IDnsQueryResponse? responseForGlue,
			uint level
		)
		{
			await _lookupsByServer.GetOrAdd(
				$"{serverName}-{level}",
				new Lazy<Task>(async () => await DoLookupImpl(
					request, 
					responseQueue,
					cancellationToken,
					serverName,
					responseForGlue,
					level
				))
			).Value;
		}

		private async Task DoLookupImpl(
			DnsLookupRequest request,
			GrpcStreamResponseQueue<DnsTraversalResponse> responseQueue,
			CancellationToken cancellationToken,
			string serverName,
			IDnsQueryResponse? responseForGlue,
			uint level
		)
		{
			var serverIps = await GetDnsServerIPs(serverName, responseForGlue);
			var client = new LookupClient(serverIps)
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
				await responseQueue.WriteAsync(new DnsTraversalResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Error = new Error
					{
						Title = $"Failed: {ex.Message}",
						Message = $"There is a problem with the DNS server at {serverName}",
					},
					From = serverName,
					Level = level,
				}, cancellationToken);
				return;
			}

			// DNS server was authoritive and no results exist
			if (response.Header.HasAuthorityAnswer && response.Answers.Count == 0)
			{
				await responseQueue.WriteAsync(new DnsTraversalResponse
				{
					Duration = (uint)stopwatch.ElapsedMilliseconds,
					Error = new Error
					{
						Title = "Failed: No results",
						Message = "This DNS record does not exist",
					},
					From = serverName,
					Level = level,
				}, cancellationToken);
				return;
			}

			await responseQueue.WriteAsync(new DnsTraversalResponse
			{
				Duration = (uint)stopwatch.ElapsedMilliseconds,
				From = serverName,
				Level = level,
				Reply = response.ToReply()
			}, cancellationToken);

			// Was this server non-authoritive?
			if (response.Answers.Count == 0)
			{
				await Task.WhenAll(
					response.Authorities.NsRecords().Select(async record => await DoLookup(
						request,
						responseQueue,
						cancellationToken,
						record.NSDName.Value.TrimEnd('.'),
						response,
						level + 1
					))
				);
			}
		}
	}
}

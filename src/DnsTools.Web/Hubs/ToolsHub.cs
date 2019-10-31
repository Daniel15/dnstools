using System;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Worker;
using Grpc.Core;
using Microsoft.AspNetCore.SignalR;

namespace DnsTools.Web.Hubs
{
	public class ToolsHub : Hub<IToolsHub>
	{
		private readonly IWorkerProvider _workerProvider;

		public ToolsHub(IWorkerProvider workerProvider)
		{
			_workerProvider = workerProvider;
		}

		public async Task<string> HelloWorld(string message)
		{
			await Clients.Caller.HelloResponse(message + "!!!!");
			return message + "ANOTHER ONE";
		}

		public ChannelReader<WorkerResponse<PingResponse>> Ping(
			PingRequest request,
			CancellationToken cancellationToken

		)
		{
			var channel = Channel.CreateUnbounded<WorkerResponse<PingResponse>>(new UnboundedChannelOptions
			{
				SingleReader = true,
				SingleWriter = false,
			});
			_ = PingAsync(request, cancellationToken, channel.Writer);
			return channel.Reader;
		}

		private async Task PingAsync(
			PingRequest request,
			CancellationToken cancellationToken,
			ChannelWriter<WorkerResponse<PingResponse>> writer
		)
		{
			try
			{
				var clients = _workerProvider.CreateAllClients();
				var requests = clients.Select(
					kvp => PingWorker(kvp.Key, kvp.Value, request, cancellationToken, writer)
				);
				await Task.WhenAll(requests).ConfigureAwait(false);
			}
			finally
			{
				writer.Complete();
			}
		}

		private async Task PingWorker(
			string workerId,
			DnsToolsWorker.DnsToolsWorkerClient client,
			PingRequest request,
			CancellationToken cancellationToken,
			ChannelWriter<WorkerResponse<PingResponse>> writer
		)
		{
			var call = client.Ping(new PingRequest
			{
				Host = request.Host,
				Protocol = request.Protocol,
			}, cancellationToken: cancellationToken);

			var responseStream = call.ResponseStream.ReadAllAsync(cancellationToken);

			try
			{
				await foreach (var response in responseStream.WithCancellation(cancellationToken))
				{
					await writer.WriteAsync(new WorkerResponse<PingResponse>
					{
						Response = response,
						WorkerId = workerId,
					}, cancellationToken).ConfigureAwait(false);
				}
			}
			catch (Exception ex)
			{
				await writer.WriteAsync(new WorkerResponse<PingResponse>
				{
					Response = new PingResponse
					{
						Error = new Error
						{
							Message = ex.Message,
						},
					},
					WorkerId = workerId,
				}, cancellationToken).ConfigureAwait(false);
			}
		}
	}
}

using System;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Worker;
using DnsTools.Worker.Models;
using Grpc.Core;

namespace DnsTools.Web.Tools
{
	public class ToolRunner<TResponse> where TResponse : IHasError, new()
	{
		private readonly IWorkerProvider _workerProvider;

		public ToolRunner(IWorkerProvider workerProvider)
		{
			_workerProvider = workerProvider;
		}

		public ChannelReader<WorkerResponse<TResponse>> Run(
			CancellationToken cancellationToken,
			Func<DnsToolsWorker.DnsToolsWorkerClient, AsyncServerStreamingCall<TResponse>> createRequest
		)
		{
			var channel = Channel.CreateUnbounded<WorkerResponse<TResponse>>(new UnboundedChannelOptions
			{
				SingleReader = true,
				SingleWriter = false,
			});
			_ = RunAsync(cancellationToken, channel.Writer, createRequest);
			return channel.Reader;
		}

		private async Task RunAsync(
			CancellationToken cancellationToken,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			Func<DnsToolsWorker.DnsToolsWorkerClient, AsyncServerStreamingCall<TResponse>> createRequest
		)
		{
			try
			{
				var clients = _workerProvider.CreateAllClients();
				var requests = clients.Select(
					kvp => RunWorkerAsync(kvp.Key, kvp.Value, cancellationToken, writer, createRequest)
				);
				await Task.WhenAll(requests).ConfigureAwait(false);
			}
			finally
			{
				writer.Complete();
			}
		}

		private async Task RunWorkerAsync(
			string workerId,
			DnsToolsWorker.DnsToolsWorkerClient client,
			CancellationToken cancellationToken,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			Func<DnsToolsWorker.DnsToolsWorkerClient, AsyncServerStreamingCall<TResponse>> createRequest
		)
		{
			var call = createRequest(client);
			var responseStream = call.ResponseStream.ReadAllAsync(cancellationToken);

			try
			{
				await foreach (var response in responseStream.WithCancellation(cancellationToken))
				{
					await writer.WriteAsync(new WorkerResponse<TResponse> 
					{
						Response = response,
						WorkerId = workerId,
					}, cancellationToken).ConfigureAwait(false);
				}
			}
			catch (Exception ex)
			{
				await writer.WriteAsync(new WorkerResponse<TResponse>
				{
					Response = new TResponse
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

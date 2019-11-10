using System;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Worker;
using DnsTools.Worker.Models;
using Grpc.Core;

namespace DnsTools.Web.Tools
{
	public abstract class ToolRunner<TRequest, TResponse> where TResponse : IHasError, new()
	{
		private readonly IWorkerProvider _workerProvider;
		public ToolRunner(IWorkerProvider workerProvider)
		{
			_workerProvider = workerProvider;
		}

		public ChannelReader<WorkerResponse<TResponse>> Run(
			TRequest request,
			IToolsHub client,
			CancellationToken cancellationToken
		)
		{
			var channel = Channel.CreateUnbounded<WorkerResponse<TResponse>>(new UnboundedChannelOptions
			{
				SingleReader = true,
				SingleWriter = false,
			});
			_ = RunAsync(request, channel.Writer, client, cancellationToken);
			return channel.Reader;
		}

		private async Task RunAsync(
			TRequest request,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			IToolsHub client,
			CancellationToken cancellationToken
		)
		{
			try
			{
				var clients = _workerProvider.CreateAllClients();
				var requests = clients.Select(
					kvp => RunWorkerAsync(kvp.Key, request, kvp.Value, writer, client, cancellationToken)
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
			TRequest request,
			DnsToolsWorker.DnsToolsWorkerClient client,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			IToolsHub hub,
			CancellationToken cancellationToken
		)
		{
			var call = CreateRequest(client, request, cancellationToken);
			var responseStream = call.ResponseStream.ReadAllAsync(cancellationToken);

			try
			{
				await foreach (var response in responseStream.WithCancellation(cancellationToken))
				{
					await ProcessResponseAsync(workerId, writer, response, hub, cancellationToken);
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

		protected abstract AsyncServerStreamingCall<TResponse> CreateRequest(
			DnsToolsWorker.DnsToolsWorkerClient client,
			TRequest request,
			CancellationToken cancellationToken
		);

		protected virtual async Task ProcessResponseAsync(
			string workerId,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			TResponse response,
			IToolsHub client,
			CancellationToken cancellationToken
		)
		{
			await writer.WriteAsync(new WorkerResponse<TResponse>
			{
				Response = response,
				WorkerId = workerId,
			}, cancellationToken).ConfigureAwait(false);
		}
	}
}

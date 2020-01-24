using System;
using System.Collections.Generic;
using System.Collections.Immutable;
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
	/// <summary>
	/// Handles running a tool via gRPC request across all available workers
	/// </summary>
	/// <typeparam name="TRequest">Type of the request</typeparam>
	/// <typeparam name="TResponse">Type of the response</typeparam>
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
			ImmutableHashSet<string>? workerIds,
			CancellationToken cancellationToken
		)
		{
			var channel = Channel.CreateUnbounded<WorkerResponse<TResponse>>(new UnboundedChannelOptions
			{
				SingleReader = true,
				SingleWriter = false,
			});
			_ = RunAsync(request, channel.Writer, client, workerIds, cancellationToken);
			return channel.Reader;
		}

		private async Task RunAsync(
			TRequest request,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			IToolsHub client,
			ImmutableHashSet<string>? workerIds,
			CancellationToken cancellationToken
		)
		{
			try
			{
				var clients = workerIds == null 
					? _workerProvider.CreateAllClients() 
					: _workerProvider.CreateClients(workerIds);
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
				var responseTasks = new List<Task>();
				await foreach (var response in responseStream.WithCancellation(cancellationToken))
				{
					responseTasks.Add(ProcessResponseAsync(workerId, writer, response, hub, cancellationToken));
				}
				responseTasks.Add(WorkerCompletedAsync(workerId, writer, cancellationToken));

				await Task.WhenAll(responseTasks);
			}
			catch (Exception ex)
			{
				var message = ex.Message;
				if (ex is RpcException rpcEx && rpcEx.StatusCode == StatusCode.Cancelled)
				{
					message = "Could not connect to this worker :(";
				}

				await writer.WriteAsync(new WorkerResponse<TResponse>
				{
					Response = new TResponse
					{
						Error = new Error
						{
							Message = message,
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

		/// <summary>
		/// Hook to send any extra response data after the worker has completed
		/// </summary>
		protected virtual Task WorkerCompletedAsync(
			string workerId,
			ChannelWriter<WorkerResponse<TResponse>> writer,
			CancellationToken cancellationToken
		)
		{
			return Task.CompletedTask;
		}
	}
}

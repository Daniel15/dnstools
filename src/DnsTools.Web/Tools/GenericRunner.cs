using System;
using System.Threading;
using DnsTools.Web.Services;
using DnsTools.Worker;
using DnsTools.Worker.Models;
using Grpc.Core;

namespace DnsTools.Web.Tools
{
	public class GenericRunner<TRequest, TResponse> : ToolRunner<TRequest, TResponse> where TResponse : IHasError, new()
	{
		private readonly Func<DnsToolsWorker.DnsToolsWorkerClient, AsyncServerStreamingCall<TResponse>> _createRequest;

		public GenericRunner(
			IWorkerProvider workerProvider,
			Func<DnsToolsWorker.DnsToolsWorkerClient, AsyncServerStreamingCall<TResponse>> createRequest
		) : base(workerProvider)
		{
			_createRequest = createRequest;
		}

		protected override AsyncServerStreamingCall<TResponse> CreateRequest(
			DnsToolsWorker.DnsToolsWorkerClient client, 
			TRequest request,
			CancellationToken cancellationToken
		)
		{
			return _createRequest(client);
		}
	}
}

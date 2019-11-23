using System.Net;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Worker;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;

namespace DnsTools.Web.Tools
{
	public class TracerouteRunner : ToolRunner<TracerouteRequest, TracerouteResponse>
	{
		private readonly IIpDataProvider _ipData;

		public TracerouteRunner(IWorkerProvider workerProvider, IIpDataProvider ipData) : base(workerProvider)
		{
			_ipData = ipData;
		}

		protected override AsyncServerStreamingCall<TracerouteResponse> CreateRequest(
			DnsToolsWorker.DnsToolsWorkerClient client,
			TracerouteRequest request,
			CancellationToken cancellationToken
		)
		{
			return client.Traceroute(new TracerouteRequest
			{
				Host = request.Host,
				Protocol = request.Protocol
			}, cancellationToken: cancellationToken);
		}

		protected override async Task ProcessResponseAsync(
			string workerId,
			ChannelWriter<WorkerResponse<TracerouteResponse>> writer,
			TracerouteResponse response,
			IToolsHub client,
			CancellationToken cancellationToken
		)
		{
			await base.ProcessResponseAsync(workerId, writer, response, client, cancellationToken);
			await _ipData.LoadDataAsync(response.Reply?.Ip, client);
		}

		protected override async Task WorkerCompletedAsync(
			string workerId,
			ChannelWriter<WorkerResponse<TracerouteResponse>> writer,
			CancellationToken cancellationToken
		)
		{
			await writer.WriteAsync(new WorkerResponse<TracerouteResponse>
			{
				Response = new TracerouteResponse
				{
					Completed = new Empty()
				},
				WorkerId = workerId,
			}, cancellationToken).ConfigureAwait(false);
		}
	}
}

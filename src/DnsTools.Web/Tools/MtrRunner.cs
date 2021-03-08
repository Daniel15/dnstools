using System.Collections.Generic;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using DnsTools.Web.Hubs;
using DnsTools.Web.Models;
using DnsTools.Web.Services;
using DnsTools.Worker;
using Grpc.Core;

namespace DnsTools.Web.Tools
{
	public class MtrRunner : ToolRunner<TracerouteRequest, MtrResponse>
	{
		private readonly IIpDataProvider _ipData;
		private readonly HashSet<string> _sentIpData = new();

		public MtrRunner(IWorkerProvider workerProvider, IIpDataProvider ipData) : base(workerProvider)
		{
			_ipData = ipData;
		}

		protected override AsyncServerStreamingCall<MtrResponse> CreateRequest(
			DnsToolsWorker.DnsToolsWorkerClient client,
			TracerouteRequest request,
			CancellationToken cancellationToken
		)
		{
			return client.Mtr(request, cancellationToken: cancellationToken);
		}

		protected override async Task ProcessResponseAsync(
			string workerId,
			ChannelWriter<WorkerResponse<MtrResponse>> writer,
			MtrResponse response,
			IToolsHub client,
			CancellationToken cancellationToken
		)
		{
			await base.ProcessResponseAsync(workerId, writer, response, client, cancellationToken);
			var ip = response.Host?.Ip;
			if (ip != null && !_sentIpData.Contains(ip))
			{
				await _ipData.LoadDataAsync(ip, client, cancellationToken);
				_sentIpData.Add(ip);
			}
		}
	}
}

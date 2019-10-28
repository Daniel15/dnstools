using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using DnsTools.Worker;
using Grpc.Core;
using Grpc.Net.Client;
using Microsoft.AspNetCore.SignalR;

namespace DnsTools.Web.Hubs
{
	public class ToolsHub : Hub<IToolsHub>
	{
		public async Task<string> HelloWorld(string message)
		{
			await Clients.Caller.HelloResponse(message + "!!!!");
			return message + "ANOTHER ONE";
		}

		public async IAsyncEnumerable<PingResponse> Ping(PingRequest request, [EnumeratorCancellation] CancellationToken cancellationToken)
		{
			//var channel = GrpcChannel.ForAddress("http://localhost:55000");
			var channel = GrpcChannel.ForAddress("http://syd02.d.sb:54561");
			var client = new DnsToolsWorker.DnsToolsWorkerClient(channel);
			var result = client.Ping(new PingRequest
			{
				Host = request.Host,
				Protocol = request.Protocol,
			}, cancellationToken: cancellationToken);

			await foreach (var reply in result.ResponseStream.ReadAllAsync(cancellationToken))
			{
				yield return reply;
			}
		}
	}
}

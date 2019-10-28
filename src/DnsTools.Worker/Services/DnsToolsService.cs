using System;
using System.Threading.Tasks;
using DnsTools.Worker.Tools;
using Grpc.Core;

namespace DnsTools.Worker.Services
{
	public class DnsToolsService : DnsToolsWorker.DnsToolsWorkerBase
	{
		public override async Task Ping(
			PingRequest request, 
			IServerStreamWriter<PingResponse> responseStream, 
			ServerCallContext context
		)
		{
			var ping = new Ping();
			try
			{
				await ping.RunAsync(request, responseStream, context.CancellationToken);
			}
			catch (Exception ex)
			{
				await responseStream.WriteAsync(new PingResponse
				{
					Error = new Error
					{
						Message = ex.Message,
					}
				});
			}
		}
	}
}

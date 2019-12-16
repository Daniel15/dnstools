using System.Threading;
using System.Threading.Tasks;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Base interface for a tool
	/// </summary>
	/// <typeparam name="TRequest">Protobuf type for incoming request</typeparam>
	/// <typeparam name="TResponse">Protobuf type for response</typeparam>
	public interface ITool<in TRequest, TResponse>
	{
		/// <summary>
		/// Runs the tool
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <param name="responseStream">Stream to write responses to</param>
		/// <param name="cancellationToken">Cancellation token for if user cancels the request</param>
		Task RunAsync(
			TRequest request,
			IServerStreamWriter<TResponse> responseStream,
			CancellationToken cancellationToken
		);
	}
}

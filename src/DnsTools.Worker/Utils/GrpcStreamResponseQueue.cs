using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Grpc.Core;

namespace DnsTools.Worker.Utils
{
	/// <summary>
	/// Wraps <see cref="IServerStreamWriter{T}"/> which only supports one writer at a time.
	/// This class can receive messages from multiple threads, and writes them to the stream
	/// one at a time.
	/// </summary>
	/// <typeparam name="T">Type of message written to the stream</typeparam>
	public class GrpcStreamResponseQueue<T>
	{
		private readonly IServerStreamWriter<T> _stream;
		private readonly Task _consumer;

		private readonly Channel<T> _channel = Channel.CreateUnbounded<T>(
			new UnboundedChannelOptions
			{
				SingleWriter = false,
				SingleReader = true,
			});

		public GrpcStreamResponseQueue(
			IServerStreamWriter<T> stream,
			CancellationToken cancellationToken = default
		)
		{
			_stream = stream;
			_consumer = Consume(cancellationToken);
		}

		/// <summary>
		/// Asynchronously writes an item to the channel. This is thread-safe.
		/// </summary>
		/// <param name="message">The value to write to the channel.</param>
		/// <param name="cancellationToken">A <see cref="T:System.Threading.CancellationToken" /> used to cancel the write operation.</param>
		/// <returns>A <see cref="T:System.Threading.Tasks.ValueTask" /> that represents the asynchronous write operation.</returns>
		public async ValueTask WriteAsync(T message, CancellationToken cancellationToken = default)
		{
			await _channel.Writer.WriteAsync(message, cancellationToken);
		}

		/// <summary>
		/// Marks the writer as completed, and waits for all writes to complete.
		/// </summary>
		public Task CompleteAsync()
		{
			_channel.Writer.Complete();
			return _consumer;
		}

		/// <summary>
		/// Consumes events from the channel and writes them to the stream
		/// </summary>
		private async Task Consume(CancellationToken cancellationToken)
		{
			await foreach (var message in _channel.Reader.ReadAllAsync(cancellationToken))
			{
				await _stream.WriteAsync(message);
			}
		}
	}
}

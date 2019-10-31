using System;
using System.Collections.Generic;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using System.Threading;
using System.Threading.Tasks;
using CliWrap;
using DnsTools.Worker.Models;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Base logic for a tool that wraps a CLI command.
	/// </summary>
	/// <typeparam name="TRequest">Protobuf type for incoming request</typeparam>
	/// <typeparam name="TResponse">Protobuf type for response</typeparam>
	public abstract class BaseCliTool<TRequest, TResponse> where TResponse : IHasError, new()
	{
		/// <summary>
		/// Runs the tool
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <param name="responseStream">Stream to write responses to</param>
		/// <param name="cancellationToken">Cancellation token for if user cancels the request</param>
		public async Task RunAsync(
			TRequest request,
			IServerStreamWriter<TResponse> responseStream,
			CancellationToken cancellationToken
		)
		{
			try
			{
				var wrap = Cli.Wrap(GetCommand(request))
					.SetArguments(GetArguments(request))
					.EnableExitCodeValidation(false)
					.EnableStandardErrorValidation(false);

				// We need to subscribe BEFORE starting the process, as CliWrap doesn't let us add
				// subscribers once started. See https://github.com/Tyrrrz/CliWrap/pull/46

				var outputObserver = Observable.Create<string>(observer =>
				{
					wrap.SetStandardOutputCallback(observer.OnNext);
					wrap.SetStandardOutputClosedCallback(observer.OnCompleted);
					return Disposable.Empty;
				});

				var errorObserver = Observable.Create<string>(observer =>
				{
					wrap.SetStandardErrorCallback(observer.OnNext);
					wrap.SetStandardErrorClosedCallback(observer.OnCompleted);
					return Disposable.Empty;
				});

				var outputTask = HandleStream(
					outputObserver,
					async data =>
					{
						if (string.IsNullOrWhiteSpace(data))
						{
							return;
						}

						TResponse response;
						try
						{
							response = ParseResponse(data);
						}
						catch (Exception ex)
						{
							response = new TResponse
							{
								Error = new Error
								{
									Message = $"Could not parse reply: {ex.Message}",
								},
							};
						}

						if (response != null)
						{
							await responseStream.WriteAsync(response);
						}
					},
					cancellationToken
				);
				var errorTask = HandleStream(
					errorObserver,
					async data =>
					{
						if (!string.IsNullOrWhiteSpace(data))
						{
							await responseStream.WriteAsync(new TResponse
							{
								Error = ParseError(data),
							});
						}
					},
					cancellationToken
				);

				var process = wrap.ExecuteAsync();
				await Task.WhenAll(process, outputTask, errorTask);
			}
			catch (Exception ex)
			{
				await responseStream.WriteAsync(new TResponse
				{
					Error = new Error
					{
						Message = ex.Message,
					}
				});
			}
		}

		private async Task HandleStream(
			IObservable<string> stream,
			Func<string, Task> handler,
			CancellationToken cancellationToken
		)
		{
			await stream.SelectMany(async data =>
			{
				await handler(data);
				return Unit.Default;
			}).LastOrDefaultAsync().ToTask(cancellationToken);
		}

		/// <summary>
		/// Gets the command to execute
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <returns>Command to execute</returns>
		protected abstract string GetCommand(TRequest request);

		/// <summary>
		/// Gets the arguments to pass to the command
		/// </summary>
		/// <param name="request">Incoming request</param>
		/// <returns>Arguments to use</returns>
		protected abstract IReadOnlyList<string> GetArguments(TRequest request);

		/// <summary>
		/// Parses a raw stdout line into a structured response
		/// </summary>
		/// <param name="data">Raw stdout line</param>
		/// <returns>Response</returns>
		protected abstract TResponse ParseResponse(string data);

		/// <summary>
		/// Parses a raw stderr line into a structured response
		/// </summary>
		/// <param name="data">Raw stderr line</param>
		/// <returns>Response</returns>
		protected virtual Error ParseError(string data)
		{
			return new Error
			{
				Message = data,
			};
		}
	}
}

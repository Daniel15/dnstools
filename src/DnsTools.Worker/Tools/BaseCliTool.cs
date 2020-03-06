using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CliWrap;
using CliWrap.EventStream;
using DnsTools.Worker.Models;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	/// <summary>
	/// Base logic for a tool that wraps a CLI command.
	/// </summary>
	/// <typeparam name="TRequest">Protobuf type for incoming request</typeparam>
	/// <typeparam name="TResponse">Protobuf type for response</typeparam>
	public abstract class BaseCliTool<TRequest, TResponse> : ITool<TRequest, TResponse> 
		where TResponse : IHasError, new()
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
			var args = await GetArguments(request, responseStream);
			var wrap = Cli.Wrap(GetCommand(request))
				.WithArguments(args)
				.WithValidation(CommandResultValidation.None)
				.ListenAsync(cancellationToken);

			await foreach (var evt in wrap.WithCancellation(cancellationToken))
			{
				switch (evt)
				{
					case StandardOutputCommandEvent stdOutEvent:
					{
						if (string.IsNullOrWhiteSpace(stdOutEvent.Text))
						{
							return;
						}

						TResponse response;
						try
						{
							response = ParseResponse(stdOutEvent.Text);
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

						break;
					}

					case StandardErrorCommandEvent stdErrEvent:
					{
						if (!string.IsNullOrWhiteSpace(stdErrEvent.Text))
						{
							await responseStream.WriteAsync(new TResponse
							{
								Error = ParseError(stdErrEvent.Text),
							});
						}

						break;
					}
				}
			}
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
		/// <param name="writer">
		/// Response writer, for if any responses need to be written *before* running the command
		/// </param>
		/// <returns>Arguments to use</returns>
		protected abstract Task<IReadOnlyList<string>> GetArguments(
			TRequest request,
			IServerStreamWriter<TResponse> writer
		);

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

using System;
using System.Collections.Generic;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CliWrap;
using DnsTools.Worker.Utils;
using Grpc.Core;

namespace DnsTools.Worker.Tools
{
	public class Ping
	{
		private static readonly Regex _timeoutRegex = new Regex(@"^no answer yet for", RegexOptions.Compiled);

		private static readonly Regex _bytesRegex = new Regex(@"(?<bytes>[0-9]+) bytes from", RegexOptions.Compiled);
		private static readonly Regex _seqRegex = new Regex(@"seq=(?<seq>[0-9]+)\b", RegexOptions.Compiled);
		private static readonly Regex _ttlRegex = new Regex(@"ttl=(?<ttl>[0-9]+)\b", RegexOptions.Compiled);
		private static readonly Regex _rttRegex = new Regex(@"time=(?<rtt>[0-9\.]+) ms\b", RegexOptions.Compiled);

		private static readonly Regex _sentRegex = new Regex(@"(?<sent>[0-9]+) packets transmitted", RegexOptions.Compiled);
		private static readonly Regex _receivedRegex = new Regex(@"(?<received>[0-9]+) received", RegexOptions.Compiled);

		public async Task RunAsync(
			PingRequest request,
			IServerStreamWriter<PingResponse> responseStream,
			CancellationToken cancellationToken
		)
		{
			Hostname.AssertValid(request.Host);
			var args = new List<string> { "-i 0.5", "-c 5", "-O", request.Host };
			switch (request.Protocol)
			{
				case Protocol.Any:
					break;

				case Protocol.Ipv4:
					args.Add("-4");
					break;

				case Protocol.Ipv6:
					args.Add("-6");
					break;

				default:
					throw new ArgumentOutOfRangeException();
			}

			var wrap = Cli.Wrap("ping")
				.SetArguments(args)
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
				async data => await HandleData(data, responseStream), 
				cancellationToken
			);
			var errorTask = HandleStream(
				errorObserver,
				async data => await HandleError(data, responseStream),
				cancellationToken
			);

			var process = wrap.ExecuteAsync();
			await Task.WhenAll(process, outputTask, errorTask);
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

		private async Task HandleData(string data, IServerStreamWriter<PingResponse> responseStream)
		{
			if (string.IsNullOrWhiteSpace(data))
			{
				return;
			}

			var response = ParseResponse(data);
			if (response != null)
			{
				//Console.WriteLine(Google.Protobuf.JsonFormatter.Default.Format(response));
				await responseStream.WriteAsync(response);
			}
		}

		private async Task HandleError(string data, IServerStreamWriter<PingResponse> responseStream)
		{
			if (!string.IsNullOrWhiteSpace(data))
			{
				await responseStream.WriteAsync(new PingResponse
				{
					Error = new Error
					{
						Message = data,
					},
				});
			}
		}

		private static PingResponse ParseResponse(string reply)
		{
			var seqMatch = _seqRegex.Match(reply);
			
			if (_timeoutRegex.IsMatch(reply))
			{
				return new PingResponse
				{
					Timeout = new PingTimeout
					{
						Seq = int.Parse(seqMatch.Groups["seq"].Value),
					},
				};
			}

			var bytesMatch = _bytesRegex.Match(reply);
			var rttMatch = _rttRegex.Match(reply);
			var ttlMatch = _ttlRegex.Match(reply);
			if (bytesMatch.Success && seqMatch.Success && rttMatch.Success && ttlMatch.Success)
			{
				return new PingResponse
				{
					Reply = new PingReply
					{
						Bytes = int.Parse(_bytesRegex.Match(reply).Groups["bytes"].Value),
						RawReply = reply,
						Rtt = float.Parse(_rttRegex.Match(reply).Groups["rtt"].Value),
						Seq = int.Parse(_seqRegex.Match(reply).Groups["seq"].Value),
						Ttl = int.Parse(_ttlRegex.Match(reply).Groups["ttl"].Value),
					}
				};
			}

			var sentMatch = _sentRegex.Match(reply);
			var receivedMatch = _receivedRegex.Match(reply);
			if (sentMatch.Success && receivedMatch.Success)
			{
				return new PingResponse
				{
					Summary = new PingSummary
					{
						RawReply = reply,
						Received = int.Parse(receivedMatch.Groups["received"].Value),
						Sent = int.Parse(sentMatch.Groups["sent"].Value),
					}
				};
			}

			return null;
		}
	}
}

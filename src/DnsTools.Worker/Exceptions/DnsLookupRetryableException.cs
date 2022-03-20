using System;
using DnsClient;

namespace DnsTools.Worker.Exceptions;

/// <summary>
/// Represents an error that occurred during DNS Lookups, where the original lookup
/// can be retried on a different server.
/// </summary>
public class DnsLookupRetryableException : Exception
{
	public long ElapsedMilliseconds { get; init; }

	public string? ServerName { get; init; }

	public DnsLookupRetryableException(
		long elapsedMilliseconds, 
		string? serverName, 
		Exception innerException
	) : base(BuildErrorMessage(innerException), innerException)
	{
		ElapsedMilliseconds = elapsedMilliseconds;
		ServerName = serverName;
	}

	public Error ToError()
	{
		return new Error
		{
			Title = $"Failed: {Message}",
			Message = $"There is a problem with the DNS server at {ServerName}",
		};
	}

	public DnsLookupResponse ToDnsLookupResponse()
	{
		return new DnsLookupResponse
		{
			Duration = (uint) ElapsedMilliseconds,
			Error = ToError(),
		};
	}

	private static string BuildErrorMessage(Exception ex)
	{
		return ex switch
		{
			DnsResponseException {Code: DnsResponseCode.ConnectionTimeout} => "Timed out",
			_ => ex.Message
		};
	}
}

using System;

namespace DnsTools.Web.Exceptions
{
	public class WorkerUnavailableException : Exception
	{
		public WorkerUnavailableException()
			: base("This location is currently unavailable. Please try again later, or email feedback@dns.tg if this error persists.")
		{
		}
	}
}

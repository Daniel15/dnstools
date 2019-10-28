using System;

namespace DnsTools.Worker.Utils
{
	/// <summary>
	/// Utilities relating to host names.
	/// </summary>
	public static class Hostname
	{
		/// <summary>
		/// Asserts that the specified hostname is valid. If not valid, throws an exception.
		/// </summary>
		/// <param name="host">Host name to validate</param>
		public static void AssertValid(string host)
		{
			var result = Uri.CheckHostName(host);
			if (result == UriHostNameType.Basic || result == UriHostNameType.Unknown)
			{
				throw new ArgumentException($"Invalid host name '{host}'");
			}
		}
	}
}

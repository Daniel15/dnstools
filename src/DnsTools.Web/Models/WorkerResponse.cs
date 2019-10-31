using Reinforced.Typings.Attributes;

namespace DnsTools.Web.Models
{
	/// <summary>
	/// Wraps a response from a worker to add more metadata.
	/// </summary>
	/// <typeparam name="T"></typeparam>
	[TsInterface(AutoI = false)]
	public class WorkerResponse<T>
	{
		/// <summary>
		/// ID of the worker that returned this response.
		/// </summary>
		public string WorkerId { get; set; }

		/// <summary>
		/// The actual response.
		/// </summary>
		public T Response { get; set; }
	}
}

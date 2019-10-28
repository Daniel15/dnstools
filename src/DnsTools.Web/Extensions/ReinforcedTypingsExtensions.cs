using System.Reflection;
using Reinforced.Typings.Fluent;

namespace DnsTools.Web.Extensions
{
	/// <summary>
	/// Extension methods for Reinforced.Typings
	/// </summary>
	public static class ReinforcedTypingsExtensions
	{
		/// <summary>
		/// Only include public instance properties from this class
		/// </summary>
		public static InterfaceExportBuilder<T> WithPublicInstanceProperties<T>(this InterfaceExportBuilder<T> builder)
		{
			return builder.WithProperties(BindingFlags.Instance | BindingFlags.Public);
		}
	}
}

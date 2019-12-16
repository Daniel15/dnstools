using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace DnsTools.Worker.Extensions
{
	/// <summary>
	/// Extensions for <see cref="IEnumerable{T}"/>
	/// </summary>
	public static class EnumerableExtensions
	{
		private static readonly ThreadLocal<Random> _random = new ThreadLocal<Random>(() => new Random());

		/// <summary>
		/// Selects a random item from the list
		/// </summary>
		/// <typeparam name="T">Type of item in the list</typeparam>
		/// <param name="list">The list.</param>
		/// <returns>A random item</returns>
		public static T Random<T>(this IEnumerable<T> list)
		{
			return list.ElementAt(_random.Value.Next(list.Count()));
		}
	}
}

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
		private static readonly ThreadLocal<Random> _random = new(() => new Random());

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

		/// <summary>
		/// Shuffle. Not perfect, but something basic is fine for our use cases.
		/// </summary>
		public static IEnumerable<T> Shuffle<T>(this IEnumerable<T> input)
		{
			return input.OrderBy(_ => _random.Value.Next());
		}
	}
}

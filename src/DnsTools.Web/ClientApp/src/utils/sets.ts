/**
 * Utilities for ES6 Sets
 */

export function sort<T>(
  input: ReadonlySet<T>,
  compareFn?: (a: T, b: T) => number,
): Set<T> {
  return new Set(Array.from(input).sort(compareFn));
}

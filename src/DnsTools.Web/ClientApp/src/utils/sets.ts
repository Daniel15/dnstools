/**
 * Utilities for ES6 Sets
 */

export function sort<T>(
  input: ReadonlySet<T>,
  compareFn?: (a: T, b: T) => number,
): Set<T> {
  return new Set(Array.from(input).sort(compareFn));
}

/**
 * Remove an item from a Set in an immutable-ish way.
 */
export function remove<T>(
  input: ReadonlySet<T>,
  valueToRemove: T,
): ReadonlySet<T> {
  if (!input.has(valueToRemove)) {
    return input;
  }

  const output = new Set(input);
  output.delete(valueToRemove);
  return output;
}

/**
 * Add an item to a Set in an immutable-ish way.
 */
export function add<T>(input: ReadonlySet<T>, valueToAdd: T): ReadonlySet<T> {
  if (input.has(valueToAdd)) {
    return input;
  }

  const output = new Set(input);
  output.add(valueToAdd);
  return output;
}

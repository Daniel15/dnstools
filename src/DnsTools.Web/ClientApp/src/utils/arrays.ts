export function findLast<T, TRefined extends T>(
  arr: ReadonlyArray<T>,
  // Allow `predicate` to refine the type
  predicate: (value: T) => value is TRefined,
): TRefined | undefined;

/**
 * Like `Array.prototype.find` except returns the *last* matching element.
 */
export function findLast<T>(
  arr: ReadonlyArray<T>,
  predicate: (value: T) => boolean,
): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) {
      return arr[i];
    }
  }
  return undefined;
}

/**
 * Get the last item in the array, or `undefined` if the array contaisn no items.
 */
export function last<T>(arr: ReadonlyArray<T>): T | undefined {
  return arr.length === 0 ? undefined : arr[arr.length - 1];
}

/**
 * Counts the number of items in the array that match the given predicate.
 */
export function countWhere<T>(
  arr: ReadonlyArray<T>,
  predicate: (value: T) => boolean,
): number {
  let total = 0;
  for (const item of arr) {
    if (predicate(item)) {
      total += 1;
    }
  }
  return total;
}

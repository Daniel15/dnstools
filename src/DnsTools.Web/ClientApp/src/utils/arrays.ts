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

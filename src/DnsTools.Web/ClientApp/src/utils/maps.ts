/**
 * Utilities for ES6 Maps.
 */

/**
 * Groups items in the specified array into a map
 */
export function groupBy<TKey, TValue>(
  arr: ReadonlyArray<TValue>,
  groupFn: (val: TValue) => TKey,
): Map<TKey, Array<TValue>> {
  const map: Map<TKey, Array<TValue>> = new Map();
  arr.forEach(val => {
    const groupName = groupFn(val);
    let group = map.get(groupName);
    if (!group) {
      group = [];
      map.set(groupName, group);
    }
    group.push(val);
  });
  return map;
}

export function map<TKey, TValue, TNewValue>(
  input: ReadonlyMap<TKey, TValue>,
  fn: (value: TValue, key: TKey) => TNewValue,
): Map<TKey, TNewValue> {
  const output: Map<TKey, TNewValue> = new Map();
  input.forEach((value, key) => {
    output.set(key, fn(value, key));
  });
  return output;
}

import {useState, useEffect} from 'react';

import useSignalrConnection from './useSignalrConnection';
import {Return as SignalrStream} from './useSignalrStream';
import useLazyRef from './useLazyRef';

type CacheData<T> = {
  callbacks: Set<(value: SignalrStream<T>) => void>;
  error: Error | null;
  results: ReadonlyArray<T>;
  isComplete: boolean;
};

export type SignalrCache<T> = Map<string, CacheData<T>>;

export function useSignalrStreamCache<T>(): SignalrCache<T> {
  return useLazyRef<SignalrCache<T>>(() => new Map());
}

/**
 * Like `useSignalrStream` except the results will be cached so that multiple calls with the
 * same arguments return the same data.
 */
export function useCachedSignalrStream<T>(
  cache: SignalrCache<T>,
  methodName: string,
  ...args: any[]
): SignalrStream<T> {
  const {connection, isConnected} = useSignalrConnection();
  const [streamData, setStreamData] = useState<SignalrStream<T>>({
    error: null,
    isComplete: false,
    results: [],
  });

  useEffect(() => {
    if (!isConnected) {
      // Not connected yet, so wait for a connection...
      return () => {};
    }

    const cacheKey = `${methodName}-${JSON.stringify(args)}`;
    let cachedData = cache.get(cacheKey);
    if (cachedData == null) {
      // No cached data for this request yet, so cache some initial data and kick off the request
      const newData: CacheData<T> = {
        callbacks: new Set(),
        error: null,
        isComplete: false,
        results: [],
      };
      cache.set(cacheKey, newData);
      connection.stream<T>(methodName, ...args).subscribe({
        next: item => {
          newData.results = [...newData.results, item];
          runCallbacks(newData);
        },
        error: error => {
          newData.error = error;
          runCallbacks(newData);
        },
        complete: () => {
          newData.isComplete = true;
          runCallbacks(newData);
        },
      });
      cachedData = newData;
    }
    setStreamData(cachedData);
    cachedData.callbacks.add(setStreamData);
    return () => {
      cachedData!.callbacks.delete(setStreamData);
    };
  }, [args, cache, connection, isConnected, methodName]);

  return streamData;
}

/**
 * Call all the callbacks that are waiting for this data.
 */
function runCallbacks<T>(cachedData: CacheData<T>): void {
  const {callbacks, ...data} = cachedData;
  callbacks.forEach(callback => callback(data));
}

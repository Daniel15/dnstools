import {useCallback, useEffect, useMemo, useState} from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import useSignalrConnection from './useSignalrConnection';

export type SignalrStream<T> = Readonly<{
  error: Error | null;
  results: ReadonlyArray<T>;
  isComplete: boolean;
}>;

type Requests = ReadonlyArray<
  Readonly<{
    methodName: string;
    args: any[];
  }>
>;

const initialStreamState = {
  error: null,
  results: [],
  isComplete: false,
};

/**
 * Calls multiple SignalR streaming methods and returns all the results together.
 */
export function useMultipleSignalrStreams<T>(
  requests: Requests,
): ReadonlyArray<SignalrStream<T>> {
  const {connection, isConnected} = useSignalrConnection();

  // TODO: Unify this with `useCachedSignalrStream` as they've converged over time

  const requestCacheKeys = useMemo(
    () =>
      requests.map(
        request => `${request.methodName}-${JSON.stringify(request.args)}`,
      ),
    [requests],
  );

  const [results, setResults] = useState<ReadonlyMap<string, SignalrStream<T>>>(
    () => new Map(),
  );

  const updateSignalrStream = useCallback(
    (
      cacheKey: string,
      updater: (oldResult: SignalrStream<T>) => SignalrStream<T>,
    ) => {
      setResults(results => {
        const oldResult = results.get(cacheKey) || initialStreamState;
        const newResults = new Map(results.entries());
        newResults.set(cacheKey, updater(oldResult));
        return newResults;
      });
    },
    [],
  );

  useEffect(() => {
    if (!isConnected) {
      // Not connected yet, so wait for a connection...
      return;
    }

    requests.forEach((request, index) => {
      const cacheKey = requestCacheKeys[index];
      let cachedData = results.get(cacheKey);
      if (cachedData == null) {
        connection.stream<T>(request.methodName, ...request.args).subscribe({
          next: item =>
            updateSignalrStream(cacheKey, result => ({
              ...result,
              results: [...result.results, item],
            })),
          error: error =>
            updateSignalrStream(cacheKey, result => ({...result, error})),
          complete: () =>
            updateSignalrStream(cacheKey, result => ({
              ...result,
              isComplete: true,
            })),
        });
        updateSignalrStream(cacheKey, () => initialStreamState);
      }
    });
  }, [
    connection,
    isConnected,
    requests,
    requestCacheKeys,
    results,
    updateSignalrStream,
  ]);

  return requests.map(
    (_, index) => results.get(requestCacheKeys[index]) || initialStreamState,
  );
}

/**
 * Calls a SignalR streaming method.
 */
export function useSignalrStream<T>(
  methodName: string,
  ...args: any[]
): SignalrStream<T> {
  const {connection, isConnected} = useSignalrConnection();
  const [results, setResults] = useState<ReadonlyArray<T>>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useDeepCompareEffect(() => {
    setResults([]);
    setError(null);
    setIsComplete(false);

    if (!isConnected) {
      // Not connected yet, so wait for a connection...
      return () => {};
    }

    const subscription = connection.stream<T>(methodName, ...args).subscribe({
      next: item => setResults(results => [...results, item]),
      error: error => setError(error),
      complete: () => setIsComplete(true),
    });

    return () => {
      subscription.dispose();
    };
  }, [methodName, args, isConnected]);

  return {results, error, isComplete};
}

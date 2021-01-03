import {useCallback, useEffect, useMemo, useState} from 'react';

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

/**
 * Calls multiple SignalR streaming methods and returns all the results together.
 */
export function useMultipleSignalrStreams<T>(
  requests: Requests,
): ReadonlyArray<SignalrStream<T>> {
  const {connection, isConnected} = useSignalrConnection();
  const [results, setResults] = useState<ReadonlyArray<SignalrStream<T>>>(() =>
    getInitialResultState(requests),
  );

  const updateSignalrStream = useCallback(
    (
      index: number,
      updates: (oldResult: SignalrStream<T>) => Partial<SignalrStream<T>>,
    ) => {
      setResults(results => {
        const newResults = [...results];
        newResults[index] = {...results[index], ...updates(results[index])};
        return newResults;
      });
    },
    [],
  );

  useEffect(() => {
    setResults(getInitialResultState(requests));

    if (!isConnected) {
      // Not connected yet, so wait for a connection...
      return;
    }

    const subscriptions = requests.map((request, index) =>
      connection.stream<T>(request.methodName, ...request.args).subscribe({
        next: item =>
          updateSignalrStream(index, result => ({
            results: [...result.results, item],
          })),
        error: error => updateSignalrStream(index, () => ({error})),
        complete: () => updateSignalrStream(index, () => ({isComplete: true})),
      }),
    );
    return () => {
      subscriptions.forEach(x => x.dispose());
    };
  }, [connection, isConnected, requests, updateSignalrStream]);

  return results;
}

function getInitialResultState(requests: Requests) {
  return requests.map(_ => ({
    error: null,
    results: [],
    isComplete: false,
  }));
}

/**
 * Calls a SignalR streaming method.
 */
export function useSignalrStream<T>(
  methodName: string,
  ...args: any[]
): SignalrStream<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const requests = useMemo(() => [{methodName, args}], [methodName, ...args]);
  const result = useMultipleSignalrStreams<T>(requests);
  return result[0];
}

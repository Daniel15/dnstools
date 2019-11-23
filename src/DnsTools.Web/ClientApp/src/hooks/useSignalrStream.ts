import {useState} from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import useSignalrConnection from './useSignalrConnection';

export default function useSignalrStream<T>(
  methodName: string,
  ...args: any[]
) {
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

    const subscription = connection.stream(methodName, ...args).subscribe({
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

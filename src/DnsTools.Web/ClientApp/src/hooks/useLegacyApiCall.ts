import {useState, useEffect} from 'react';

export default function useLegacyApiCall(uri: string) {
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setResults(null);
    setError(null);
    fetch(`/legacy/${uri}`)
      .then(response => response.text())
      .then(
        response => setResults(response),
        error => setError(error),
      );
  }, [uri]);

  return {results, error, isLoading: results === null && error == null};
}

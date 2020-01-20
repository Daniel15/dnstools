import {useCallback, useState} from 'react';

type Return<T> = [React.Ref<T>, T | null];

/**
 * Similar to `useRef` except uses state so the component re-renders on change.
 */
export default function useStateRef<T>(): Return<T> {
  const [value, setValue] = useState<T | null>(null);
  const ref = useCallback(value => {
    setValue(value);
  }, []);

  return [ref, value];
}

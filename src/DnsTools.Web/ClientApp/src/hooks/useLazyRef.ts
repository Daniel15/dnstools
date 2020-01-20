import {useRef} from 'react';

/**
 * Like `useRef` except the initial value is lazily created.
 * See https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
 */
export default function useLazyRef<T>(valueFactory: () => T) {
  const ref = useRef<T | null>(null);
  if (!ref.current) {
    ref.current = valueFactory();
  }
  return ref.current;
}

import ResizeObserver from 'resize-observer-polyfill';
import {useLayoutEffect, useState} from 'react';

import useLazyRef from './useLazyRef';

export type Dimensions = {
  height: number;
  width: number;
};

type Return<T> = [(value: T) => void, Dimensions];

/**
 * Measures the dimensions of a specified DOM element, reacting to any changes in size.
 * `ref` should be used as a ref on the element.
 */
export default function useDimensions<T extends HTMLElement>(): Return<T> {
  const [node, ref] = useState<T>();
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: 0,
    width: 0,
  });
  const observer = useLazyRef(
    () =>
      new ResizeObserver((data: ResizeObserverEntry[]) =>
        setDimensions(data[0].contentRect),
      ),
  );
  useLayoutEffect(() => {
    if (node) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  }, [node, observer]);

  return [ref, dimensions];
}

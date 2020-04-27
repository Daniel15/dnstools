import {useLayoutEffect, useRef} from 'react';

/**
 * Like `useLayoutEffect` except does not call the callback on the initial render.
 */
export default function useLayoutEffectExceptInitialRender(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
): void {
  const hasRendered = useRef<boolean>(false);
  useLayoutEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      return;
    }
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

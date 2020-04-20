import {useEffect, useState} from 'react';

export const isPrerendering = navigator.userAgent === 'ReactSnap';

/**
 * React hook that returns `true` if prerendering or on initial render (to allow rehydration,
 * or `false` otherwise).
 */
export function useIsPrerendering(): boolean {
  const [isPrerender, setIsPrerender] = useState(true);
  useEffect(() => {
    if (!isPrerendering) {
      setIsPrerender(false);
    }
  }, []);

  return isPrerender;
}

import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router-dom';

/**
 * Side effects (eg. logging) that occur when client-side page navigation occurs.
 */
export default function NavigationSideEffects() {
  const {pathname, search} = useLocation();
  const hasInitialized = useRef(false);
  useEffect(() => {
    // Scroll to the top on route change
    window.scrollTo(0, 0);

    // Tell Google Analytics that the page has changed, but not for initial
    // load (as it does that for us automatically).
    if (hasInitialized.current) {
      ga('set', 'page', pathname);
      ga('send', 'pageview');
    }
    hasInitialized.current = true;
  }, [pathname, search]);
  return null;
}

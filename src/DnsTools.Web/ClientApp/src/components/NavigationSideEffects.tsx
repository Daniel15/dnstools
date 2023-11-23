import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

/**
 * Side effects (eg. logging) that occur when client-side page navigation occurs.
 */
export default function NavigationSideEffects() {
  const {pathname, search} = useLocation();
  useEffect(() => {
    // Scroll to the top on route change
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

import {useLocation} from 'react-router';
import {useMemo} from 'react';

export default function useQueryString(): URLSearchParams {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

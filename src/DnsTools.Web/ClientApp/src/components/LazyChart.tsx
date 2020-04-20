import * as React from 'react';
import {ReactGoogleChartProps} from 'react-google-charts/dist/types';
import {isPrerendering} from '../utils/prerendering';

const Chart = React.lazy(() => import('react-google-charts'));

export default function LazyChart(props: ReactGoogleChartProps) {
  const placeholder = <LoadingPlaceholder height={props.height || 0} />;
  if (isPrerendering) {
    return placeholder;
  }
  return (
    <React.Suspense fallback={placeholder}>
      <Chart loader={placeholder} {...props} />
    </React.Suspense>
  );
}

function LoadingPlaceholder({height}: {height: string | number}) {
  return (
    <div
      style={{
        height,
        textAlign: 'center',
        paddingTop: '250px',
      }}>
      Loading...
    </div>
  );
}

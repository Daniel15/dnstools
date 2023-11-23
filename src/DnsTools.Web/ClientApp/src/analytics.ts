import type {EventOptions, PlausibleOptions} from 'plausible-tracker';
import Plausible from 'plausible-tracker';
import {init as sentryInit} from '@sentry/react';

import {apiUrl, sentryJS as SentryConfig} from './config';

const shouldLog =
  (!__DEV__ || document.location.search.includes('enable_logging')) &&
  navigator.userAgent !== 'ReactSnap';

// Use a no-op trackEvent() in dev or when running ReactSnap
let trackEvent: (
  eventName: string,
  options?: EventOptions,
  eventData?: PlausibleOptions,
) => void = () => {};

// Error logging
if (shouldLog) {
  sentryInit({
    dsn: SentryConfig.dsn,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.0,
    tunnel: `${apiUrl}/error/log`,
  });

  // Analytics
  const {
    enableAutoPageviews,
    enableAutoOutboundTracking,
    trackEvent: realTrackEvent,
  } = Plausible({
    apiHost: __DEV__ ? 'https://hits.d.sb' : apiUrl,
    domain: 'dnstools.ws',
    trackLocalhost: true,
  });

  enableAutoPageviews();
  enableAutoOutboundTracking();
  trackEvent = realTrackEvent;
}

export {trackEvent};

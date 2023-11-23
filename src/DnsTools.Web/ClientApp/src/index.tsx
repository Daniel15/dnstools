import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import {
  init as sentryInit,
  ErrorBoundary as SentryErrorBoundary,
} from '@sentry/react';
import {apiUrl, sentryJS as SentryConfig} from './config';

const appWithErrorBoundary = (
  <SentryErrorBoundary
    fallback={errorData => (
      <>
        <p>Sorry, an error occurred: {errorData.error?.message}.</p>
        <p>
          Please contact me at feedback@dns.tg and let me know what went wrong.{' '}
          {errorData.eventId && (
            <>
              Include <strong>error ID {errorData.eventId}</strong> in your
              email.
            </>
          )}
        </p>
      </>
    )}>
    <App />
  </SentryErrorBoundary>
);

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(appWithErrorBoundary, rootElement);
} else {
  ReactDOM.render(appWithErrorBoundary, rootElement);
}

if (!__DEV__ || document.location.search.includes('enable_error_logging')) {
  sentryInit({
    dsn: SentryConfig.dsn,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.0,
    tunnel: `${apiUrl}error/log`,
  });
}

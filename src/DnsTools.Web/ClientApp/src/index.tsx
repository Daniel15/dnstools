import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import {init as lazySentryInit} from './LazySentry/LazySentry';
import {LazySentryErrorBoundary} from './LazySentry/LazySentryErrorBoundary';
import {sentryJS as SentryConfig} from './config';

const appWithErrorBoundary = (
  <LazySentryErrorBoundary
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
  </LazySentryErrorBoundary>
);

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(appWithErrorBoundary, rootElement);
} else {
  ReactDOM.render(appWithErrorBoundary, rootElement);
}

if (!__DEV__) {
  window.setTimeout(() => {
    lazySentryInit({
      dsn: SentryConfig.dsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: 1.0,
    });
  }, 0);
}

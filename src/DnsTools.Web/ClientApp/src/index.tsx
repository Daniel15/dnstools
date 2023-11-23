import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary as SentryErrorBoundary} from '@sentry/react';

import './index.scss';
import './analytics';
import App from './App';

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

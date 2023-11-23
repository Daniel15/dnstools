import {
  defaultWorker,
  googleMapsKey,
  ReCaptcha,
  sentryJS,
  workers,
} from './config.json';

export {defaultWorker, googleMapsKey, ReCaptcha, sentryJS, workers};

export let apiUrl = 'https://api.dnstools.ws';
if (/^(localhost|dnstools.test)/.test(window.location.hostname)) {
  apiUrl = 'https://localhost:5011';
} else if (window.location.hostname.includes('staging')) {
  apiUrl = 'https://api.staging.dnstools.ws';
}

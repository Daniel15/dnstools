import {
  defaultWorker,
  googleMapsKey,
  ReCaptcha,
  sentryJS,
  workers,
} from './config.json';

export {defaultWorker, googleMapsKey, ReCaptcha, sentryJS, workers};

export const apiUrl = /^(localhost|dnstools.test)/.test(
  window.location.hostname,
)
  ? 'https://localhost:5011/'
  : 'https://api.dnstools.ws/';

import {defaultWorker, googleMapsKey, ReCaptcha, workers} from './config.json';

export {defaultWorker, googleMapsKey, ReCaptcha, workers};

export const apiUrl = /^(localhost|dnstools.test)/.test(
  window.location.hostname,
)
  ? 'https://localhost:5011/'
  : 'https://api.dnstools.ws/';

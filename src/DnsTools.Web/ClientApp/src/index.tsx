import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Config} from './types/generated';

declare global {
  interface Window {
    DnsToolsConfig: Config;
  }
}

ReactDOM.render(
  <App config={window.DnsToolsConfig} />,
  document.getElementById('root'),
);

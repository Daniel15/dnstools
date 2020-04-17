import React from 'react';
import {Helmet} from 'react-helmet';

import MainForm from '../components/MainForm';
import Config from '../config.json';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Welcome to DNSTools!</title>
      </Helmet>
      <div className="jumbotron mt-5">
        <h1 className="display-4">Welcome to DNSTools!</h1>
        <p className="lead">
          DNSTools lets you perform DNS lookups, pings, traceroutes, and other
          utilities, from {Config.workers.length} locations around the world.
        </p>
        <MainForm isStandalone={false} showSecondaryFooter={true} />
      </div>
    </>
  );
}

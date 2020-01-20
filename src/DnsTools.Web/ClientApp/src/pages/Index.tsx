import React from 'react';
import {Helmet} from 'react-helmet';

import {Config} from '../types/generated';
import MainForm from '../components/MainForm';

type Props = {
  config: Config;
};

export default function Index(props: Props) {
  return (
    <>
      <Helmet>
        <title>Welcome to DNSTools!</title>
      </Helmet>
      <div className="jumbotron mt-5">
        <h1 className="display-4">Welcome to DNSTools!</h1>
        <p className="lead">
          DNSTools lets you perform DNS lookups, pings, traceroutes, and other
          utilities, from {props.config.workers.length} locations around the
          world.
        </p>
        <MainForm
          config={props.config}
          isStandalone={false}
          showSecondaryFooter={true}
        />
      </div>
    </>
  );
}

import React from 'react';
import {Helmet} from 'react-helmet';

import MainForm from '../components/MainForm';
import Config from '../config.json';
import {Link} from 'react-router-dom';

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
          utilities, from{' '}
          <Link to="/locations/">{Config.workers.length} locations</Link> around
          the world.
        </p>
        <MainForm isStandalone={false} showSecondaryFooter={true} />
      </div>
    </>
  );
}

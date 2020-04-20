import React from 'react';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

import MainForm from '../components/MainForm';
import Config from '../config.json';
import {useIsPrerendering} from '../utils/prerendering';

export default function Index() {
  const isPrerender = useIsPrerendering();
  return (
    <>
      <Helmet>
        <title>Welcome to DNSTools!</title>
        <meta
          name="description"
          content={`DNSTools lets you perform DNS lookups, pings, traceroutes, and other utilities, from ${Config.workers.length} locations around the world.`}
        />
      </Helmet>
      <div className="jumbotron mt-5">
        <h1 className="display-4">Welcome to DNSTools!</h1>
        <p className="lead">
          DNSTools lets you perform DNS lookups, pings, traceroutes, and other
          utilities, from{' '}
          <Link to="/locations/">{Config.workers.length} locations</Link> around
          the world.
        </p>
        <MainForm
          isLoading={isPrerender}
          isStandalone={false}
          showSecondaryFooter={true}
        />
      </div>
    </>
  );
}

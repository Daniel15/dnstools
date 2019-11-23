import React from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import Spinner from '../components/Spinner';
import useLegacyApiCall from '../hooks/useLegacyApiCall';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}>;

export default function DnsLookup(props: Props) {
  const {host, type} = props.match.params;
  const {results, error, isLoading} = useLegacyApiCall(
    `lookup/${host}/${type.toUpperCase()}/`,
  );
  return (
    <>
      <Helmet>
        <title>DNS Lookup for {host}</title>
      </Helmet>
      <h1 className="main-header">
        DNS Lookup for {host} {isLoading && <Spinner />}
      </h1>
      <div dangerouslySetInnerHTML={{__html: results || ''}} />
      {error && <>ERROR: {error.message}</>}
    </>
  );
}

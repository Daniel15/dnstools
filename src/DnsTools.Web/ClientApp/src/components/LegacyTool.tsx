import React, {MouseEvent} from 'react';
import Helmet from 'react-helmet';
import {useHistory} from 'react-router';

import Spinner from './Spinner';
import useLegacyApiCall from '../hooks/useLegacyApiCall';

type Props = {
  title: string;
  url: string;
};

export default function LegacyTool(props: Props) {
  const {results, error, isLoading} = useLegacyApiCall(props.url);

  const history = useHistory();
  function handleClick(evt: MouseEvent) {
    const target = evt.target;
    if (target instanceof HTMLAnchorElement) {
      const href = target.getAttribute('href');
      if (href) {
        evt.preventDefault();
        history.push(href);
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>{props.title}</title>
      </Helmet>
      <h1 className="main-header">
        {props.title} {isLoading && <Spinner />}
      </h1>
      <div
        dangerouslySetInnerHTML={{__html: results || ''}}
        onClick={handleClick}
      />
      {error && <>ERROR: {error.message}</>}
    </>
  );
}

import React from 'react';

import {WorkerConfig} from '../utils/workers';
import CountryFlag from './CountryFlag';
import WithHovercard from './WithHovercard';
import {trackEvent} from '../analytics';

type Props = Readonly<{
  flagSize?: number;
  worker: WorkerConfig;
}>;

export default function WorkerLocation({flagSize, worker}: Props) {
  const url =
    worker.providerUrl +
    (worker.providerUrl.includes('?') ? '&' : '?') +
    'utm_source=dnstools&utm_medium=worker-location-link&utm_campaign=dnstools-worker-location-link';
  return (
    <WithHovercard
      location="right"
      tooltipBody={
        <>
          {worker.city}, {worker.region}, {worker.country}
          <br />
          Provider: {/* eslint-disable-next-line react/jsx-no-target-blank */}
          <a
            className="alert-link"
            href={url}
            target="_blank"
            rel="nofollow noopener"
            onClick={() => {
              trackEvent('Hosting Provider Link (Location)', {
                props: {
                  provider_name: worker.providerName,
                },
              });
            }}>
            {worker.providerName}
          </a>{' '}
          (AS{worker.networkAsn})<br />
          Data Center: {worker.dataCenterName}
        </>
      }>
      <CountryFlag country={worker.country} size={flagSize} />
      {worker.locationDisplay}
    </WithHovercard>
  );
}

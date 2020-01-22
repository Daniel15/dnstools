import React from 'react';

import {WorkerConfig} from '../types/generated';
import CountryFlag from './CountryFlag';
import WithHovercard, {HovercardLocation} from './WithHovercard';

type Props = Readonly<{
  worker: WorkerConfig;
}>;

export default function WorkerLocation({worker}: Props) {
  const url =
    worker.providerUrl +
    (worker.providerUrl.includes('?') ? '&' : '?') +
    'utm_source=dnstools&utm_medium=worker-location-link&utm_campaign=dnstools-worker-location-link';
  return (
    <WithHovercard
      location={HovercardLocation.Right}
      tooltipBody={
        <>
          {worker.city}, {worker.region}, {worker.country}
          <br />
          Provider:{' '}
          <a
            className="alert-link"
            href={url}
            /* eslint-disable-next-line react/jsx-no-target-blank */
            target="_blank"
            rel="nofollow noopener"
            onClick={() => {
              ga(
                'send',
                'event',
                'Hosting Provider Link (Location)',
                'click',
                worker.providerName,
              );
            }}>
            {worker.providerName}
          </a>{' '}
          (AS{worker.networkAsn})<br />
          Data Center: {worker.dataCenterName}
        </>
      }>
      <CountryFlag country={worker.country} />
      {worker.locationDisplay}
    </WithHovercard>
  );
}

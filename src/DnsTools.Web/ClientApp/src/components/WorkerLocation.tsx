import React from 'react';

import {WorkerConfig} from '../types/generated';
import CountryFlag from './CountryFlag';
import WithHovercard, {HovercardLocation} from './WithHovercard';

type Props = Readonly<{
  worker: WorkerConfig;
}>;

export default function WorkerLocation({worker}: Props) {
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
            href={worker.providerUrl}
            /* eslint-disable-next-line react/jsx-no-target-blank */
            target="_blank"
            rel="nofollow noopener">
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

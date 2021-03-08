import React from 'react';

import CountryFlag from './CountryFlag';
import {IpData} from '../types/generated';

type Props = Readonly<{
  ip: string;
  ipData: IpData | undefined;
}>;

export default function IPDetails(props: Props) {
  const {ip, ipData} = props;

  const metadata: Array<React.ReactNode> = [];
  if (ipData) {
    if (ipData.countryIso) {
      metadata.push(
        <>
          <CountryFlag country={ipData.countryIso} />
          {[ipData.city, ipData.country].filter(Boolean).join(', ')}
        </>,
      );
    }
    if (ipData.asn) {
      metadata.push(`AS${ipData.asn} ${ipData.asnName}`);
    }
  }

  return (
    <>
      {ipData && ipData.hostName ? (
        <>
          <strong>{ipData.hostName}</strong> ({ip})
        </>
      ) : (
        <strong>{ip}</strong>
      )}{' '}
      <ul className="list-inline text-muted mb-0">
        {metadata.map((item, index) => (
          <li className="list-inline-item" key={index}>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

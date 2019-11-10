import React from 'react';

import {
  IpData,
  ITracerouteRequest,
  TracerouteResponseType,
  WorkerResponse,
} from '../types/generated';
import {TracerouteResponse as TracerouteResponseData} from '../types/protobuf';
import CountryFlag from './CountryFlag';

type Props = {
  ipData?: IpData | undefined;
  result: WorkerResponse<TracerouteResponseData>;
};

export default function TracerouteResponse(props: Props) {
  const {response} = props.result;
  switch (response.responseCase) {
    case TracerouteResponseType.Reply:
      return (
        <p>
          <b>{props.result.workerId}</b>
          {response.reply.seq} Reply: {response.reply.rtt} from{' '}
          {(props.ipData && props.ipData.hostName) || response.reply.ip}
          <ul>
            <li>{response.reply.ip}</li>
            {props.ipData && props.ipData.countryIso && (
              <li>
                {props.ipData.countryIso && (
                  <CountryFlag country={props.ipData.countryIso} />
                )}
                {[props.ipData.city, props.ipData.country]
                  .filter(Boolean)
                  .join(', ')}
              </li>
            )}
            {props.ipData && props.ipData.asn && (
              <li>
                AS{props.ipData.asn} {props.ipData.asnName}
              </li>
            )}
          </ul>
        </p>
      );

    case TracerouteResponseType.Error:
      return <p>ERR</p>;

    case TracerouteResponseType.Timeout:
      return <p>TIMEOUT</p>;
  }
}

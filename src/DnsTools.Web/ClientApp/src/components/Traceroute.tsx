import React from 'react';

import {
  IpData,
  ITracerouteRequest,
  TracerouteResponseType,
  WorkerResponse,
} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import ReactTracerouteResponse from './TracerouteResponse';

type Props = {
  ipData: ReadonlyMap<string, IpData>;
  request: ITracerouteRequest;
};

export default function Traceroute(props: Props) {
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    props.request,
  );
  return (
    <>
      {data.results.map((result, index) => {
        const ipData =
          result.response.responseCase === TracerouteResponseType.Reply
            ? props.ipData.get(result.response.reply.ip)
            : undefined;
        return (
          <ReactTracerouteResponse
            ipData={ipData}
            key={index}
            result={result}
          />
        );
      })}
    </>
  );
}

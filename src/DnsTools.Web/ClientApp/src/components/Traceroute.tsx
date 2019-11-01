import React from 'react';

import {
  ITracerouteRequest,
  TracerouteResponseType,
  WorkerResponse,
} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';

type Props = {
  request: ITracerouteRequest;
};

export default function Traceroute(props: Props) {
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    props.request,
  );
  return (
    <>
      {data.results.map(result => {
        const {response} = result;
        switch (response.responseCase) {
          case TracerouteResponseType.Reply:
            return (
              <p>
                <b>{result.workerId}</b>
                {response.reply.seq} Reply: {response.reply.rtt} from{' '}
                {response.reply.ip}
              </p>
            );

          case TracerouteResponseType.Error:
            return <p>ERR</p>;

          case TracerouteResponseType.Timeout:
            return <p>TIMEOUT</p>;
        }
      })}
    </>
  );
}

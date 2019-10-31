import React from 'react';

import {
  IPingRequest,
  PingResponseType,
  WorkerResponse,
} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';

type Props = {
  request: IPingRequest;
};

export default function Ping(props: Props) {
  const data = useSignalrStream<WorkerResponse<PingResponse>>(
    'ping',
    props.request,
  );
  return (
    <>
      {data.results.map(result => {
        const {response} = result;
        switch (response.responseCase) {
          case PingResponseType.Reply:
            return <p>Reply: {response.reply.rtt}</p>;

          case PingResponseType.Summary:
            return <p>SUmmary</p>;

          case PingResponseType.Error:
            return <p>ERR</p>;

          case PingResponseType.Timeout:
            return <p>TIMEOUT</p>;
        }
      })}
    </>
  );
}

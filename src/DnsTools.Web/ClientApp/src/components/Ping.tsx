import React from 'react';

import {IPingRequest, PingResponseType} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';

type Props = {
  request: IPingRequest;
};

export default function Ping(props: Props) {
  const data = useSignalrStream<PingResponse>('ping', props.request);
  return (
    <>
      {data.results.map(result => {
        switch (result.responseCase) {
          case PingResponseType.Reply:
            return <p>Reply: {result.reply.rtt}</p>;

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

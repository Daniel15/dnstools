import React from 'react';

import {WorkerConfig, PingResponseType, IPingReply} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import CountryFlag from './CountryFlag';
import {average, standardDeviation} from '../math';
import {milliseconds} from '../format';

type Props = {
  results: ReadonlyArray<PingResponse>;
  worker: Readonly<WorkerConfig>;
};

export default function PingWorkerResult(props: Props) {
  const replies: Array<IPingReply> = [];
  const errors: Array<string> = [];
  let timeouts = 0;

  props.results.forEach(result => {
    switch (result.responseCase) {
      case PingResponseType.Reply:
        replies.push(result.reply);
        break;

      case PingResponseType.Error:
        errors.push(result.error.message);
        break;

      case PingResponseType.Timeout:
        timeouts++;
    }
  });

  const isLoading = props.results.length === 0 && errors.length === 0;

  const replyTimes = replies.map(reply => reply.rtt);
  const avgReply = average(replyTimes);
  const dev = standardDeviation(replyTimes);

  let rowText = null;
  if (isLoading) {
    rowText = 'Loading...';
  } else if (errors.length > 0) {
    rowText = 'ERROR: ' + errors.join(', ');
  }

  return (
    <>
      <tr>
        <td>
          <CountryFlag country={props.worker.country} />
          {props.worker.location}
          <br />
          {props.worker.name}
        </td>
        {rowText && <td colSpan={4}>{rowText}</td>}
        {!rowText && (
          <>
            <td>{milliseconds(avgReply)}</td>
            <td>{replyTimes.length > 1 && milliseconds(dev)}</td>
            <td>{replyTimes.length}</td>
            <td>{timeouts}</td>
          </>
        )}
      </tr>
    </>
  );
}

import React from 'react';

import {WorkerConfig, PingResponseType, IPingReply} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import CountryFlag from './CountryFlag';
import ShimmerBar from './ShimmerBar';
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
    rowText = <ShimmerBar />;
  } else if (errors.length > 0) {
    rowText = 'ERROR: ' + errors.join(', ');
  }

  return (
    <>
      <tr>
        <td className="align-middle">
          <CountryFlag country={props.worker.country} />
          {props.worker.location}
        </td>
        {rowText && (
          <td className="align-middle" colSpan={4}>
            {rowText}
          </td>
        )}
        {!rowText && (
          <>
            <td className="align-middle">{milliseconds(avgReply)}</td>
            <td className="align-middle">
              {replyTimes.length > 1 && milliseconds(dev)}
            </td>
            <td className="align-middle">{replyTimes.length}</td>
            <td className="align-middle">{timeouts}</td>
          </>
        )}
      </tr>
    </>
  );
}

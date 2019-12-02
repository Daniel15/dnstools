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

  props.results.forEach(result => {
    switch (result.responseCase) {
      case PingResponseType.Reply:
        replies.push(result.reply);
        break;

      case PingResponseType.Error:
        errors.push(result.error.message);
        break;
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
            <td className="align-middle">
              <PingProgress results={props.results} />
            </td>
          </>
        )}
      </tr>
    </>
  );
}

const REPLY_COUNT = 5;
const PROGRESS_BAR_PIECE_PERCENT = (1 / REPLY_COUNT) * 100;
function PingProgress(props: {results: ReadonlyArray<PingResponse>}) {
  if (props.results.length >= REPLY_COUNT) {
    const timeouts = props.results.filter(
      result => result.responseCase === PingResponseType.Error,
    );
    if (timeouts.length > 0) {
      return <>{timeouts.length} timeouts</>;
    }
    return null;
  }

  return (
    <div className="progress">
      {props.results
        .filter(
          result =>
            result.responseCase === PingResponseType.Reply ||
            result.responseCase === PingResponseType.Error,
        )
        .map(response => (
          <div
            className={`progress-bar ${
              response.responseCase === PingResponseType.Error
                ? 'bg-danger'
                : ''
            }`}
            role="progressbar"
            style={{width: `${PROGRESS_BAR_PIECE_PERCENT}%`}}
            aria-valuenow={PROGRESS_BAR_PIECE_PERCENT}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ))}
    </div>
  );
}

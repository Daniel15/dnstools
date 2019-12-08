import React from 'react';

import {WorkerConfig, PingResponseType, IPingReply} from '../types/generated';
import {PingResponse, PingHostLookupResponse} from '../types/protobuf';
import CountryFlag from './CountryFlag';
import ShimmerBar from './ShimmerBar';
import {average, standardDeviation} from '../math';
import {milliseconds} from '../format';
import {sumIf} from '../utils/array';

type Props = {
  results: ReadonlyArray<PingResponse>;
  showIP: boolean;
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
        break;
    }
  });

  const isLoading =
    replies.length === 0 && errors.length === 0 && timeouts === 0;

  const replyTimes = replies.map(reply => reply.rtt);
  const avgReply = average(replyTimes);
  const dev = standardDeviation(replyTimes);

  let rowText = null;
  if (errors.length > 0) {
    rowText = 'ERROR: ' + errors.join(', ');
  } else if (isLoading) {
    rowText = <ShimmerBar />;
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
              <PingProgress results={props.results} showIP={props.showIP} />
            </td>
          </>
        )}
      </tr>
    </>
  );
}

const REPLY_COUNT = 5;
const PROGRESS_BAR_PIECE_PERCENT = (1 / REPLY_COUNT) * 100;
function PingProgress(props: {
  showIP: boolean;
  results: ReadonlyArray<PingResponse>;
}) {
  const replyCount = sumIf(
    props.results,
    result => result.responseCase === PingResponseType.Reply,
  );
  const timeoutCount = sumIf(
    props.results,
    result => result.responseCase === PingResponseType.Timeout,
  );
  if (replyCount + timeoutCount >= REPLY_COUNT) {
    const textPieces = [];

    if (props.showIP) {
      const lookup = props.results.find(
        (result): result is PingHostLookupResponse =>
          result.responseCase === PingResponseType.Lookup,
      );
      if (lookup != null) {
        textPieces.push(lookup.lookup.ip);
      }
    }
    if (timeoutCount > 0) {
      textPieces.push(`{timeoutCount} timeouts`);
    }

    return textPieces.length === 0 ? null : <>{textPieces.join(', ')}</>;
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

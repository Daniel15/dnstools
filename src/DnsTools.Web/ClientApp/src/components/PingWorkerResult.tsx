import React from 'react';

import {PingResponseType, IPingReply, IPingSummary} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import WorkerLocation from './WorkerLocation';
import ShimmerBar from './ShimmerBar';
import {average, standardDeviation} from '../utils/math';
import {milliseconds} from '../utils/format';
import {WorkerConfig} from '../utils/workers';
import {Row, Column} from './Table';

type Props = {
  results: ReadonlyArray<PingResponse>;
  showIP: boolean;
  worker: Readonly<WorkerConfig>;
  workerIndex: number;
};

export function createRow(props: Props): Row {
  const replies: Array<IPingReply> = [];
  const errors: Array<string> = [];
  let summary: IPingSummary | undefined;
  let ip: string | undefined;
  let timeouts = 0;

  props.results.forEach(result => {
    switch (result.responseCase) {
      case PingResponseType.Lookup:
        if (props.showIP) {
          ip = result.lookup.ip;
        }
        break;

      case PingResponseType.Reply:
        replies.push(result.reply);
        break;

      case PingResponseType.Error:
        errors.push(result.error.message);
        break;

      case PingResponseType.Timeout:
        timeouts++;
        break;

      case PingResponseType.Summary:
        summary = result.summary;
        break;
    }
  });

  const isLoading =
    replies.length === 0 && errors.length === 0 && timeouts === 0;

  const replyTimes = replies.map(reply => reply.rtt);
  const avgReply = replyTimes.length > 0 ? average(replyTimes) : null;
  const dev = standardDeviation(replyTimes);

  let rowText: React.ReactNode | null = null;
  if (errors.length > 0) {
    rowText = 'ERROR: ' + errors.join(', ');
  } else if (summary != null && summary.received === 0) {
    // All requests timed out
    rowText = 'Timed out';
    if (ip != null) {
      rowText += ` (${ip})`;
    }
  } else if (isLoading) {
    rowText = <ShimmerBar />;
  }

  const columns: Array<Column> = [
    {
      // Maintain original order as per config
      sortValue: props.workerIndex,
      value: <WorkerLocation worker={props.worker} />,
    },
  ];

  if (rowText) {
    columns.push({
      colSpan: 3,
      sortValue: null,
      value: rowText,
    });
  } else {
    columns.push(
      {
        sortValue: avgReply,
        value: avgReply && milliseconds(avgReply),
      },
      {
        sortValue: dev,
        value: replyTimes.length > 1 && milliseconds(dev),
      },
      {
        // If still loading, sort by the number of results received
        // If finished loading, sort by IP (if one is specified). If `ip` is undefined,
        // nothing is showing in this cell (that is, every row has the same IP)
        sortValue: summary == null ? props.results.length : ip,
        value: (
          <PingProgress results={props.results} ip={ip} summary={summary} />
        ),
      },
    );
  }

  return {
    columns,
    id: props.worker.id,
  };
}

const REPLY_COUNT = 5;
const PROGRESS_BAR_PIECE_PERCENT = (1 / REPLY_COUNT) * 100;
function PingProgress(props: {
  ip: string | undefined;
  summary: IPingSummary | undefined;
  results: ReadonlyArray<PingResponse>;
}) {
  if (props.summary != null) {
    // Ping has completed, so show some summary info

    const textPieces = [];
    if (props.ip != null) {
      textPieces.push(props.ip);
    }
    const timeoutCount = props.summary.sent - props.summary.received;
    if (timeoutCount > 0) {
      textPieces.push(`${timeoutCount} timeouts`);
    }

    return textPieces.length === 0 ? null : <>{textPieces.join(', ')}</>;
  }

  return (
    <div className="progress">
      {props.results
        .filter(
          result =>
            result.responseCase === PingResponseType.Reply ||
            result.responseCase === PingResponseType.Error ||
            result.responseCase === PingResponseType.Timeout,
        )
        .map((response, index) => (
          <div
            className={`progress-bar ${
              response.responseCase === PingResponseType.Error ||
              response.responseCase === PingResponseType.Timeout
                ? 'bg-danger'
                : ''
            }`}
            key={index}
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

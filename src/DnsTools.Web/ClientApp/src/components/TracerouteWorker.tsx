import React from 'react';

import {TracerouteResponse} from '../types/protobuf';
import {TracerouteResponseType, IpData} from '../types/generated';
import ReactTracerouteResponse from '../components/TracerouteResponse';
import TracerouteResponseLoadingPlaceholder from '../components/TracerouteResponseLoadingPlaceholder';
import Spinner, {Size as SpinnerSize} from '../components/Spinner';
import WorkerLocation from './WorkerLocation';
import {WorkerConfig} from '../utils/workers';

type Props = {
  areAllCompleted: boolean;
  ipData: ReadonlyMap<string, IpData>;
  isCard: boolean;
  responses: ReadonlyArray<TracerouteResponse>;
  worker: WorkerConfig;
};

const LOADING_PLACEHOLDER_COUNT = 8;

export default function TracerouteWorker(props: Props) {
  const {worker} = props;

  const responses = props.responses.filter(
    x =>
      x.responseCase !== TracerouteResponseType.Completed &&
      x.responseCase !== TracerouteResponseType.Lookup,
  );
  const isCompleted =
    props.areAllCompleted ||
    !!props.responses.find(
      x => x.responseCase === TracerouteResponseType.Completed,
    );

  let finalReply: TracerouteResponse | null = responses[responses.length - 1];
  if (
    !isCompleted ||
    !finalReply ||
    finalReply.responseCase !== TracerouteResponseType.Reply
  ) {
    finalReply = null;
  }

  const loadingPlaceholdersToShow = isCompleted
    ? 0
    : LOADING_PLACEHOLDER_COUNT - responses.length;

  let content = (
    <ul className={`list-group ${props.isCard ? 'list-group-flush' : ''}`}>
      {responses.map((response, index) => {
        const ipData =
          response.responseCase === TracerouteResponseType.Reply
            ? props.ipData.get(response.reply.ip)
            : undefined;

        return (
          <ReactTracerouteResponse
            index={index}
            ipData={ipData}
            isFinalReply={response === finalReply}
            key={index}
            response={response}
          />
        );
      })}
      {loadingPlaceholdersToShow > 0 && (
        <TracerouteResponseLoadingPlaceholder
          seq={responses.length + 1}
          count={loadingPlaceholdersToShow}
        />
      )}
    </ul>
  );

  if (props.isCard) {
    return (
      <div className="col mb-4">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>
              <WorkerLocation worker={worker} />
            </span>
            <span>{!isCompleted && <Spinner size={SpinnerSize.Small} />}</span>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
}

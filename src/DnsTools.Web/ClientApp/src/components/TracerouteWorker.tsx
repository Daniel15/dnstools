import React from 'react';

import {TracerouteResponse} from '../types/protobuf';
import {WorkerConfig, TracerouteResponseType, IpData} from '../types/generated';
import CountryFlag from '../components/CountryFlag';
import ReactTracerouteResponse from '../components/TracerouteResponse';
import Spinner, {Size as SpinnerSize} from '../components/Spinner';

type Props = {
  areAllCompleted: boolean;
  ipData: ReadonlyMap<string, IpData>;
  responses: ReadonlyArray<TracerouteResponse>;
  worker: WorkerConfig;
};

export default function TracerouteWorker(props: Props) {
  const {worker} = props;

  const responses = props.responses.filter(
    x => x.responseCase !== TracerouteResponseType.Completed,
  );
  const isCompleted =
    props.areAllCompleted ||
    !!props.responses.find(
      x => x.responseCase === TracerouteResponseType.Completed,
    );

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>
          <CountryFlag country={worker.country} />
          {worker.location}
        </span>
        <span>{!isCompleted && <Spinner size={SpinnerSize.Small} />}</span>
      </div>
      <ul className="list-group list-group-flush">
        {responses.map((response, index) => {
          const ipData =
            response.responseCase === TracerouteResponseType.Reply
              ? props.ipData.get(response.reply.ip)
              : undefined;

          return (
            <ReactTracerouteResponse
              index={index}
              ipData={ipData}
              key={index}
              response={response}
            />
          );
        })}
      </ul>
    </div>
  );
}

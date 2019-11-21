import React from 'react';

import {
  IpData,
  ITracerouteRequest,
  TracerouteResponseType,
  WorkerResponse,
  WorkerConfig,
} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import ReactTracerouteResponse from './TracerouteResponse';
import groupResponsesByWorker from '../groupResponsesByWorker';
import CountryFlag from './CountryFlag';
import Spinner from './Spinner';

type Props = {
  ipData: ReadonlyMap<string, IpData>;
  request: ITracerouteRequest;
  workers: ReadonlyArray<Readonly<WorkerConfig>>;
};

export default function Traceroute(props: Props) {
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    props.request,
  );
  const workerResponses = groupResponsesByWorker(props.workers, data.results);

  return (
    <>
      <h1 className="main-header">
        Traceroute {props.request.host} {!data.isComplete && <Spinner />}
      </h1>
      <div className="card-deck">
        {workerResponses.map(worker => (
          <div className="card">
            <div className="card-header">
              <CountryFlag country={worker.worker.country} />
              {worker.worker.location}
            </div>
            <ul className="list-group list-group-flush">
              {worker.responses.map((response, index) => {
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
        ))}
      </div>
    </>
  );
}

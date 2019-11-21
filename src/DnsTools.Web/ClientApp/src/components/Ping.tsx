import React from 'react';

import {IPingRequest, WorkerResponse, WorkerConfig} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import PingWorkerResult from './PingWorkerResult';
import Spinner from './Spinner';

type Props = {
  request: IPingRequest;
  workers: ReadonlyArray<Readonly<WorkerConfig>>;
};

export default function Ping(props: Props) {
  const data = useSignalrStream<WorkerResponse<PingResponse>>(
    'ping',
    props.request,
  );

  const responsesByWorker: Map<string, Array<PingResponse>> = new Map();
  data.results.forEach(result => {
    let workerResults = responsesByWorker.get(result.workerId);
    if (!workerResults) {
      workerResults = [];
      responsesByWorker.set(result.workerId, workerResults);
    }
    workerResults.push(result.response);
  });

  return (
    <>
      <h1 className="main-header">
        Ping {props.request.host} {!data.isComplete && <Spinner />}
      </h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Location</th>
            <th scope="col">Response Time</th>
            <th scope="col">Deviation</th>
            <th scope="col">Replies</th>
            <th scope="col">Timeouts</th>
          </tr>
        </thead>
        <tbody>
          {props.workers.map(worker => (
            <PingWorkerResult
              results={responsesByWorker.get(worker.id) || []}
              worker={worker}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}

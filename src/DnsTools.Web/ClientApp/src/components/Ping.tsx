import React from 'react';

import {IPingRequest, WorkerResponse, WorkerConfig} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import PingWorkerResult from './PingWorkerResult';

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
      Pinging {props.request.host}...
      {data.isComplete && 'DONE!'}
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Response Time</th>
            <th>Deviation</th>
            <th>Replies</th>
            <th>Timeouts</th>
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

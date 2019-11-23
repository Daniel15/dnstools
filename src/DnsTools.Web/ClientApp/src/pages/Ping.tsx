import React, {useMemo} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {IPingRequest, WorkerResponse, Config} from '../types/generated';
import {PingResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import PingWorkerResult from '../components/PingWorkerResult';
import Spinner from '../components/Spinner';
import groupResponsesByWorker from '../groupResponsesByWorker';
import useQueryString from '../hooks/useQueryString';
import {getProtocol} from '../utils/queryString';
import MainForm, {defaultInput, Tool} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
}> & {
  config: Config;
};

export default function Ping(props: Props) {
  const host = props.match.params.host;
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);

  const request: IPingRequest = useMemo(() => ({host, protocol}), [
    host,
    protocol,
  ]);
  const data = useSignalrStream<WorkerResponse<PingResponse>>('ping', request);
  const workerResponses = groupResponsesByWorker(
    props.config.workers,
    data.results,
  );

  return (
    <>
      <Helmet>
        <title>Ping {host}</title>
      </Helmet>
      <h1 className="main-header">
        Ping {host} {!data.isComplete && <Spinner />}
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
          {workerResponses.map(worker => (
            <PingWorkerResult
              key={worker.worker.id}
              results={worker.responses}
              worker={worker.worker}
            />
          ))}
        </tbody>
      </table>

      <MainForm
        config={props.config}
        initialInput={{
          ...defaultInput,
          host,
          protocol,
        }}
        initialSelectedTool={Tool.Ping}
        isStandalone={true}
      />
    </>
  );
}

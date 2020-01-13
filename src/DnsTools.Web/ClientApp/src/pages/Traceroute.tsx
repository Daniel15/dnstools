import React, {useMemo} from 'react';
import {RouteComponentProps} from 'react-router';
import Helmet from 'react-helmet';

import {IpData, PingRequest, WorkerResponse, Config} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import useQueryString from '../hooks/useQueryString';
import {getProtocol, getWorkers} from '../utils/queryString';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';
import TracerouteWorker from '../components/TracerouteWorker';
import {groupResponsesByWorker, serializeWorkers} from '../utils/workers';

type Props = RouteComponentProps<{
  host: string;
}> & {
  ipData: ReadonlyMap<string, IpData>;
  config: Config;
};

export default function Traceroute(props: Props) {
  const host = props.match.params.host;
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);
  const workers = useMemo(() => getWorkers(props.config, queryString), [
    props.config,
    queryString,
  ]);

  const request: PingRequest = useMemo(
    () => ({host, protocol, workers: serializeWorkers(props.config, workers)}),
    [host, protocol, workers, props.config],
  );
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    request,
  );
  const workerResponses = groupResponsesByWorker(
    props.config.workers,
    workers,
    data.results,
  );

  return (
    <>
      <Helmet>
        <title>Traceroute to {host}</title>
      </Helmet>
      <h1 className="main-header">Traceroute to {host}</h1>
      <div className="row row-cols-1 row-cols-md-2">
        {workerResponses.map(worker => (
          <TracerouteWorker
            areAllCompleted={data.isComplete}
            ipData={props.ipData}
            key={worker.worker.id}
            responses={worker.responses}
            worker={worker.worker}
          />
        ))}
      </div>
      <MainForm
        config={props.config}
        initialInput={{
          ...getDefaultInput(props.config),
          host,
          protocol,
          workers,
        }}
        initialSelectedTool={Tool.Traceroute}
        isStandalone={true}
      />
    </>
  );
}

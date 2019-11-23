import React, {useMemo} from 'react';
import {RouteComponentProps} from 'react-router';
import Helmet from 'react-helmet';

import {
  IpData,
  ITracerouteRequest,
  WorkerResponse,
  Config,
} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import groupResponsesByWorker from '../groupResponsesByWorker';
import useQueryString from '../hooks/useQueryString';
import {getProtocol} from '../utils/queryString';
import MainForm, {defaultInput, Tool} from '../components/MainForm';
import TracerouteWorker from '../components/TracerouteWorker';

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

  const request: ITracerouteRequest = useMemo(() => ({host, protocol}), [
    host,
    protocol,
  ]);
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    request,
  );
  const workerResponses = groupResponsesByWorker(
    props.config.workers,
    data.results,
  );

  return (
    <>
      <Helmet>
        <title>Traceroute to {host}</title>
      </Helmet>
      <h1 className="main-header">Traceroute to {host}</h1>
      <div className="card-deck">
        {workerResponses.map(worker => (
          <TracerouteWorker
            areAllCompleted={data.isComplete}
            ipData={props.ipData}
            responses={worker.responses}
            worker={worker.worker}
          />
        ))}
      </div>
      {data.isComplete && (
        <MainForm
          config={props.config}
          initialInput={{
            ...defaultInput,
            host,
            protocol,
          }}
          initialSelectedTool={Tool.Traceroute}
          isStandalone={true}
        />
      )}
    </>
  );
}

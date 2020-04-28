import * as React from 'react';

import {WorkerConfig, getLongLocationDisplay} from '../utils/workers';
import {
  PingRequest,
  Protocol,
  WorkerResponse,
  IpData,
} from '../types/generated';
import {useCachedSignalrStream} from '../hooks/CachedSignalrStream';
import {TracerouteResponse} from '../types/protobuf';
import {SignalrCache} from '../hooks/CachedSignalrStream';
import TracerouteWorker from './TracerouteWorker';

type Props = Readonly<{
  ip: string | undefined;
  ipData: ReadonlyMap<string, IpData>;
  tracerouteCache: SignalrCache<WorkerResponse<TracerouteResponse>>;
  worker: WorkerConfig;
}>;

export default function PingDetails(props: Props) {
  const {worker} = props;

  return (
    <div style={{marginBottom: '0.75rem'}}>
      {getLongLocationDisplay(worker)} · {worker.providerName} (AS
      {worker.networkAsn})
      {props.ip != null && (
        <PingDetailsTraceroute
          ip={props.ip}
          ipData={props.ipData}
          tracerouteCache={props.tracerouteCache}
          worker={props.worker}
        />
      )}
    </div>
  );
}

function PingDetailsTraceroute(
  props: Readonly<{
    ip: string;
    ipData: ReadonlyMap<string, IpData>;
    tracerouteCache: SignalrCache<WorkerResponse<TracerouteResponse>>;
    worker: WorkerConfig;
  }>,
) {
  const request: PingRequest = {
    host: props.ip,
    protocol: Protocol.Any,
    workers: [props.worker.id],
  };
  const data = useCachedSignalrStream<WorkerResponse<TracerouteResponse>>(
    props.tracerouteCache,
    'traceroute',
    request,
  );

  return (
    <>
      <h5 className="mt-3 card-header">Traceroute</h5>
      <TracerouteWorker
        areAllCompleted={false}
        ipData={props.ipData}
        isCard={false}
        responses={data.results.map(x => x.response)}
        worker={props.worker}
      />
    </>
  );
}

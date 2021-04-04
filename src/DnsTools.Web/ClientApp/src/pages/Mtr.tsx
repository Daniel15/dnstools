import React, {useMemo} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';
import {DeepWritable} from 'ts-essentials';

import {defaultWorker} from '../config';
import MtrTable from '../components/MtrTable';
import WorkerLocation from '../components/WorkerLocation';
import {
  IError,
  IpData,
  MtrPingLine,
  MtrResponseType,
  MtrTransmitLine,
  PingRequest,
  WorkerResponse,
} from '../types/generated';
import {MtrResponse} from '../types/protobuf';
import {getProtocol} from '../utils/queryString';
import useQueryString from '../hooks/useQueryString';
import {SignalrStream, useSignalrStream} from '../hooks/useSignalrStream';
import {getWorkerConfig} from '../utils/workers';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
  worker: string;
}> &
  Readonly<{
    ipData: ReadonlyMap<string, IpData>;
  }>;

type MtrData = Readonly<{
  errors: ReadonlyArray<IError>;
  hops: ReadonlyArray<MtrPosData>;
  ip: string;
}>;

export type MtrPosData = Readonly<{
  ips: ReadonlyArray<string>;
  transmits: ReadonlyArray<MtrTransmitLine>;
  responses: ReadonlyArray<MtrPingLine>;
}>;

export default function Mtr(props: Props) {
  const host = props.match.params.host;
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);
  const worker = props.match.params.worker || defaultWorker;
  const workerConfig = getWorkerConfig(worker);

  const request: PingRequest = useMemo(
    () => ({
      host,
      protocol,
      workers: [worker],
    }),
    [host, protocol, worker],
  );
  const rawData = useSignalrStream<WorkerResponse<MtrResponse>>('mtr', request);
  const data = parseMTRData(rawData);

  // Show the form at the bottom once we have more than 2 responses for the first hop
  // (don't show it while the hops are still populating)
  // TODO: Use ?. once Babel is upgraded
  //const showForm = data.hops[0]?.responses?.length > 2;
  const showForm =
    data.hops[0] && data.hops[0].transmits && data.hops[0].transmits.length > 1;

  return (
    <>
      <Helmet>
        <title>
          MTR for {host} from {workerConfig.locationDisplay}
        </title>
      </Helmet>
      <h1 className="main-header">
        MTR for {host} from{' '}
        <WorkerLocation flagSize={30} worker={workerConfig} />
      </h1>
      <MtrTable data={data.hops} ipData={props.ipData} />

      {data.errors.map((error, index) => (
        <div className="alert alert-danger mt-2" key={index} role="alert">
          {error.message}
        </div>
      ))}
      {/* TODO: Stop button */}
      {showForm && (
        <MainForm
          initialInput={{
            ...getDefaultInput(),
            hosts: [host],
            protocol,
            worker,
          }}
          initialSelectedTool={Tool.Mtr}
          isStandalone={true}
        />
      )}
    </>
  );
}

function parseMTRData(
  rawData: SignalrStream<WorkerResponse<MtrResponse>>,
): MtrData {
  const data: DeepWritable<MtrData> = {
    errors: [],
    ip: '',
    hops: [],
  };

  function getHopData(result: WorkerResponse<MtrResponse>) {
    let posData = data.hops[result.response.pos];
    if (posData == null) {
      posData = {
        ips: [],
        transmits: [],
        responses: [],
      };
      data.hops[result.response.pos] = posData;
    }
    return posData;
  }

  rawData.results.forEach(result => {
    switch (result.response.responseCase) {
      case MtrResponseType.Lookup:
        data.ip = result.response.lookup.ip;
        break;

      case MtrResponseType.Host:
        getHopData(result).ips.push(result.response.host.ip);
        break;

      case MtrResponseType.Transmit:
        getHopData(result).transmits.push(result.response.transmit);
        break;

      case MtrResponseType.Ping:
        getHopData(result).responses.push(result.response.ping);
        break;

      case MtrResponseType.Error:
        data.errors.push(result.response.error);
    }
  });

  return {
    ...data,
    hops: trimExtraneousHopsFromEnd(data.hops),
  };
}

/**
 * mtr can return extraneous hops at the end, as the initial number of pings it sends
 * may be greater than the number of hops to reach the destination. This function
 * trims those extraneous hops from the end of the results.
 * @see https://github.com/traviscross/mtr/issues/388
 */
function trimExtraneousHopsFromEnd(
  hops: ReadonlyArray<MtrPosData>,
): ReadonlyArray<MtrPosData> {
  if (hops.length < 2) {
    return hops;
  }

  let lastIP;
  const hopsWithLastIP: Array<number> = [];
  for (let i = hops.length - 1; i >= 0; i--) {
    const currHop = hops[i];

    if (lastIP == null && currHop.ips[0] != null) {
      // This is the last hop with a resolved IP. Save the IP to check the other hops
      lastIP = currHop.ips[0];
    }

    if (lastIP != null && !currHop.ips.includes(lastIP)) {
      // We've reached a hop that doesn't include the last IP
      break;
    }

    hopsWithLastIP.push(i);
  }

  if (hopsWithLastIP.length <= 1) {
    return hops;
  }

  hopsWithLastIP.pop();
  return hops.filter((_, index) => !hopsWithLastIP.includes(index));
}

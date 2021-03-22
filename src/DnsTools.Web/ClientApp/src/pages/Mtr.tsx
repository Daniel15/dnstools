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

      {/* TODO <MainForm
        initialInput={currentInput}
        initialSelectedTool={Tool.Ping}
        isStandalone={true}
      /> */}
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

// https://github.com/traviscross/mtr/issues/388
function trimExtraneousHopsFromEnd(
  hops: ReadonlyArray<MtrPosData>,
): ReadonlyArray<MtrPosData> {
  if (hops.length < 2) {
    return hops;
  }

  let lastIP;
  const hopsToRemove = new Set();
  for (let i = hops.length - 1; i >= 0; i--) {
    const currHop = hops[i];

    if (lastIP == null && currHop.ips[0] != null) {
      // This is the last hop with a resolved IP. Save the IP to check the other hops
      lastIP = currHop.ips[0];
    } else if (lastIP != null) {
      if (currHop.ips.includes(lastIP)) {
        // This hop has an IP identical to the last IP. Remove the hop.
        hopsToRemove.add(i);
      } else {
        break;
      }
    }
  }

  return hopsToRemove.size === 0
    ? hops
    : hops.filter((_, index) => !hopsToRemove.has(index));
}

import React, {useMemo} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {
  PingRequest,
  WorkerResponse,
  PingResponseType,
  IpData,
} from '../types/generated';
import Config from '../config.json';
import {
  PingResponse,
  PingHostLookupResponse,
  TracerouteResponse,
} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import {createRow} from '../components/PingWorkerResult';
import Table, {Header} from '../components/Table';
import Spinner from '../components/Spinner';
import useQueryString from '../hooks/useQueryString';
import {getProtocol, getWorkers} from '../utils/queryString';
import {serializeWorkers, groupResponsesByWorker} from '../utils/workers';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';
import {useSignalrStreamCache} from '../hooks/CachedSignalrStream';

type Props = RouteComponentProps<{
  host: string;
}> & {
  ipData: ReadonlyMap<string, IpData>;
};

const headers: ReadonlyArray<Header> = [
  {label: 'Location', width: '25%'},
  {label: 'Response Time', width: '20%'},
  {label: 'Deviation', width: '20%'},
  {label: 'Info'},
];

export default function Ping(props: Props) {
  const host = props.match.params.host;
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);
  const workers = useMemo(() => getWorkers(queryString), [queryString]);
  const tracerouteCache = useSignalrStreamCache<
    WorkerResponse<TracerouteResponse>
  >();

  const request: PingRequest = useMemo(
    () => ({host, protocol, workers: serializeWorkers(workers)}),
    [host, protocol, workers],
  );
  const data = useSignalrStream<WorkerResponse<PingResponse>>('ping', request);
  const workerResponses = groupResponsesByWorker(workers, data.results);

  const {showIPs, onlyIP} = summarizeIPs(data.results);
  const rows = workerResponses.map((worker, index) =>
    createRow({
      ipData: props.ipData,
      results: worker.responses,
      showIP: showIPs,
      tracerouteCache,
      worker: worker.worker,
      workerIndex: index,
    }),
  );

  return (
    <>
      <Helmet>
        <title>Ping {host}</title>
      </Helmet>
      <h1 className="main-header">
        Ping {host} {onlyIP && onlyIP !== host && <>({onlyIP})</>}{' '}
        {!data.isComplete && <Spinner />}
      </h1>
      <Table
        areRowsExpandable={true}
        defaultSortColumn="Location"
        headers={headers}
        isStriped={true}
        sections={[{rows}]}
      />

      <MainForm
        initialInput={{
          ...getDefaultInput(),
          host,
          protocol,
          workers,
        }}
        initialSelectedTool={Tool.Ping}
        isStandalone={true}
      />
    </>
  );
}

/**
 * Determines if IP addresses should be shown per row (if the IP differs per location,
 * for example when a host uses GeoIP), or if the IP address is the same across all
 * workers.
 */
function summarizeIPs(
  results: ReadonlyArray<WorkerResponse<PingResponse>>,
): {
  showIPs: boolean;
  onlyIP: string | null;
} {
  const hostLookups = results.filter(
    (result): result is WorkerResponse<PingHostLookupResponse> =>
      result.response.responseCase === PingResponseType.Lookup,
  );

  if (hostLookups.length === 0) {
    return {
      showIPs: false,
      onlyIP: null,
    };
  }

  const firstIP = hostLookups[0].response.lookup.ip;
  const firstWorker = Config.workers.find(
    worker => worker.id === hostLookups[0].workerId,
  );
  const areAllSameIP = hostLookups.every(
    lookup => lookup.response.lookup.ip === firstIP,
  );

  if (!areAllSameIP) {
    return {
      showIPs: true,
      onlyIP: null,
    };
  }

  const areAllSameCountry = hostLookups.every(lookup => {
    // This does a linear search, but almost all workers are in a different country, so generally
    // it'll do at most a single search, which is fine.
    const worker = Config.workers.find(worker => worker.id === lookup.workerId);
    return (
      firstWorker == null ||
      worker == null ||
      firstWorker.country === worker.country
    );
  });

  // If at least two countries have returned data, and they both have the same IP, it's likely
  // the IP is the same in every country (ie. no GeoIP in use) and we can start displaying
  // it as the only IP.
  if (!areAllSameCountry) {
    return {
      showIPs: false,
      onlyIP: firstIP,
    };
  }

  return {
    showIPs: false,
    onlyIP: null,
  };
}

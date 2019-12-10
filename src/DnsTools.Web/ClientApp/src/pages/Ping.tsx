import React, {useMemo} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';

import {
  PingRequest,
  WorkerResponse,
  Config,
  PingResponseType,
} from '../types/generated';
import {PingResponse, PingHostLookupResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import PingWorkerResult from '../components/PingWorkerResult';
import Spinner from '../components/Spinner';
import groupResponsesByWorker from '../groupResponsesByWorker';
import useQueryString from '../hooks/useQueryString';
import {getProtocol, getWorkers} from '../utils/queryString';
import {serializeWorkers} from '../utils/workers';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
}> & {
  config: Config;
};

export default function Ping(props: Props) {
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
  const data = useSignalrStream<WorkerResponse<PingResponse>>('ping', request);
  const workerResponses = groupResponsesByWorker(
    props.config.workers,
    workers,
    data.results,
  );

  const {showIPs, onlyIP} = summarizeIPs(props.config, data.results);

  return (
    <>
      <Helmet>
        <title>Ping {host}</title>
      </Helmet>
      <h1 className="main-header">
        Ping {host} {onlyIP && onlyIP !== host && <>({onlyIP})</>}{' '}
        {!data.isComplete && <Spinner />}
      </h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Location</th>
            <th scope="col">Response Time</th>
            <th scope="col">Deviation</th>
            <th scope="col">Info</th>
          </tr>
        </thead>
        <tbody>
          {workerResponses.map(worker => (
            <PingWorkerResult
              key={worker.worker.id}
              results={worker.responses}
              showIP={showIPs}
              worker={worker.worker}
            />
          ))}
        </tbody>
      </table>

      <MainForm
        config={props.config}
        initialInput={{
          ...getDefaultInput(props.config),
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
  config: Config,
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
  const firstWorker = config.workers.find(
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
    const worker = config.workers.find(worker => worker.id === lookup.workerId);
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

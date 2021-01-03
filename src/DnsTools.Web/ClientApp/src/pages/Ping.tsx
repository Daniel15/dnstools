import React, {useMemo, useState} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps, useHistory} from 'react-router';

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
import {useMultipleSignalrStreams} from '../hooks/useSignalrStream';
import {createRow} from '../components/PingWorkerResult';
import Table from '../components/Table';
import Spinner from '../components/Spinner';
import useQueryString from '../hooks/useQueryString';
import {getProtocol, getWorkers} from '../utils/queryString';
import {serializeWorkers, groupResponsesByWorker} from '../utils/workers';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';
import {useSignalrStreamCache} from '../hooks/CachedSignalrStream';
import {defaultWorker} from '../config';
import {buildToolURI} from '../utils/url';
import WorkerLocation from '../components/WorkerLocation';

type Props = RouteComponentProps<{
  hosts: string;
  worker?: string;
}> & {
  ipData: ReadonlyMap<string, IpData>;
  isSingleWorker: boolean;
};

export default function Ping(props: Props) {
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);
  const hosts = useMemo(() => {
    const hosts = props.match.params.hosts.split(',');
    return props.isSingleWorker ? hosts : [hosts[0]];
  }, [props.match.params.hosts, props.isSingleWorker]);
  const workers = useMemo(
    () =>
      props.isSingleWorker
        ? new Set([props.match.params.worker || defaultWorker])
        : getWorkers(queryString),
    [props.isSingleWorker, props.match.params.worker, queryString],
  );

  const tracerouteCache = useSignalrStreamCache<
    WorkerResponse<TracerouteResponse>
  >();

  const requests = useMemo(
    () =>
      hosts.map(host => {
        const request: PingRequest = {
          host,
          protocol,
          workers: serializeWorkers(workers),
        };
        return {methodName: 'ping', args: [request]};
      }),
    [hosts, protocol, workers],
  );

  const data = useMultipleSignalrStreams<WorkerResponse<PingResponse>>(
    requests,
  );

  const workerResponses = data.flatMap(streamResult =>
    groupResponsesByWorker(workers, streamResult.results),
  );

  let showIPs = true;
  let onlyIP = null;
  if (!props.isSingleWorker) {
    ({showIPs, onlyIP} = summarizeIPs(data[0].results || []));
  }

  const rows = workerResponses.map((worker, index) =>
    createRow({
      host: props.isSingleWorker ? hosts[index] : null,
      ipData: props.ipData,
      results: worker.responses,
      showIP: showIPs,
      tracerouteCache,
      worker: worker.worker,
      workerIndex: index,
    }),
  );

  const title = props.isSingleWorker
    ? `Ping from ${workerResponses[0].worker.locationDisplay}`
    : `Ping ${hosts}`;

  const history = useHistory();
  const [newHost, setNewHost] = useState('');

  const currentInput = {
    ...getDefaultInput(),
    hosts,
    protocol,
    worker: props.match.params.worker || defaultWorker,
    workers,
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <h1 className="main-header">
        {props.isSingleWorker ? (
          <>
            Ping from{' '}
            <WorkerLocation flagSize={30} worker={workerResponses[0].worker} />
          </>
        ) : (
          title
        )}{' '}
        {onlyIP && onlyIP !== props.match.params.hosts && <>({onlyIP})</>}{' '}
        {!data.every(x => x.isComplete) && <Spinner />}
      </h1>
      <Table
        areRowsExpandable={true}
        defaultSortColumn={props.isSingleWorker ? 'Host' : 'Location'}
        headers={[
          props.isSingleWorker
            ? {label: 'Host', width: '25%'}
            : {label: 'Location', width: '25%'},
          {label: 'Response Time', width: '20%'},
          {label: 'Deviation', width: '20%'},
          {label: 'Info'},
        ]}
        isStriped={true}
        key={title}
        sections={[{rows}].concat(
          props.isSingleWorker
            ? {
                rows: [
                  {
                    columns: [
                      {
                        colSpan: 2,
                        sortValue: '',
                        value: (
                          <form
                            onSubmit={evt => {
                              evt.preventDefault();
                              if (newHost === '') {
                                return;
                              }
                              history.push(
                                buildToolURI({
                                  tool: Tool.Ping,
                                  input: {
                                    ...currentInput,
                                    hosts: [...hosts, newHost],
                                  },
                                }),
                              );
                              setNewHost('');
                            }}>
                            <input
                              type="text"
                              className="form-control"
                              id="host"
                              placeholder="Add another"
                              value={newHost}
                              onChange={evt =>
                                setNewHost(evt.target.value.trim())
                              }
                            />
                          </form>
                        ),
                      },
                      {
                        colSpan: 3,
                        sortValue: '',
                        value: '',
                      },
                    ],
                    id: 'add_more',
                  },
                ],
              }
            : [],
        )}
      />
      <MainForm
        initialInput={currentInput}
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

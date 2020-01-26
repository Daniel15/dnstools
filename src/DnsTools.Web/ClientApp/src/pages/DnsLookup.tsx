import React, {useMemo} from 'react';
import {RouteComponentProps} from 'react-router';

import {
  Config,
  DnsLookupType,
  DnsLookupRequest,
  WorkerResponse,
  Protocol,
} from '../types/generated';
import {DnsLookupResponse} from '../types/protobuf';
import MainForm, {Tool, getDefaultInput} from '../components/MainForm';
import {getWorkers, getLookupType} from '../utils/queryString';
import useQueryString from '../hooks/useQueryString';
import useSignalrStream from '../hooks/useSignalrStream';
import Helmet from 'react-helmet';
import Spinner from '../components/Spinner';
import DnsLookupResults from '../components/DnsLookupResults';
import DnsLookupWorkerResult from '../components/DnsLookupWorkerResult';
import {Link} from 'react-router-dom';
import {groupResponsesByWorker} from '../utils/workers';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}> & {
  config: Config;
};

export default function DnsLookup(props: Props) {
  const {host, type: rawType} = props.match.params;
  const type = getLookupType(rawType);
  const queryString = useQueryString();
  const workers = useMemo(() => getWorkers(props.config, queryString), [
    props.config,
    queryString,
  ]);

  const request: DnsLookupRequest = useMemo(
    () => ({host, type, workers: Array.from(workers)}),
    [host, type, workers],
  );
  const data = useSignalrStream<WorkerResponse<DnsLookupResponse>>(
    'dnslookup',
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
        <title>DNS Lookup for {host}</title>
      </Helmet>
      <h1 className="main-header">
        DNS Lookup for {host} ({rawType}) {!data.isComplete && <Spinner />}
      </h1>
      {workerResponses.length === 1 && (
        <DnsLookupResults
          host={host}
          lookupType={type}
          responses={workerResponses[0].responses}
        />
      )}
      {workerResponses.length > 1 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col" style={{width: 10}}>
                &nbsp;
              </th>
              <th scope="col">Location</th>
              <th scope="col" style={{width: '40%'}}>
                Result
              </th>
              <th scope="col" style={{width: '40%'}}>
                Server
              </th>
            </tr>
          </thead>
          <tbody>
            {workerResponses.map((worker, index) => (
              <DnsLookupWorkerResult
                host={host}
                index={index}
                key={worker.worker.id}
                lookupType={type}
                responses={worker.responses}
                worker={worker.worker}
              />
            ))}
          </tbody>
        </table>
      )}
      {/* Show footer if we have multiple workers in a table, or if it's one worker that's completed */}
      {(data.isComplete || workerResponses.length > 1) && (
        <>
          <p>
            These results are returned in real-time, and are not cached. This
            means that these results are what DNS servers all over the world are
            seeing at the moment.
            <br />
            <Link to={`/traversal/${host}/${rawType}/`}>
              See a DNS traversal
            </Link>
            .<br />
            <br />
            The ability to perform a DNS lookup from multiple locations is
            coming in the future.
            {(type === DnsLookupType.A || type === DnsLookupType.Aaaa) && (
              <>
                {' '}
                For now, to perform this DNS lookup from all available
                locations,{' '}
                <Link
                  to={`/ping/${host}/?proto=${
                    type === DnsLookupType.A
                      ? Protocol[Protocol.Ipv4]
                      : Protocol[Protocol.Ipv6]
                  }`}>
                  use the ping tool
                </Link>
                .
              </>
            )}
          </p>

          <MainForm
            config={props.config}
            initialInput={{
              ...getDefaultInput(props.config),
              host,
              dnsLookupType: type,
              worker: workers.values().next().value,
            }}
            initialSelectedTool={
              type === DnsLookupType.Ptr ? Tool.ReverseDns : Tool.DnsLookup
            }
            isStandalone={true}
          />
        </>
      )}
    </>
  );
}

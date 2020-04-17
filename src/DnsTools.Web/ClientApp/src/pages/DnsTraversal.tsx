import React, {useMemo} from 'react';
import {RouteComponentProps} from 'react-router';

import {
  DnsLookupRequest,
  WorkerResponse,
  DnsTraversalResponseType,
  DnsRecordType,
} from '../types/generated';
import Config from '../config.json';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';
import {getWorkers, getLookupType} from '../utils/queryString';
import useQueryString from '../hooks/useQueryString';
import Helmet from 'react-helmet';
import {
  DnsTraversalResponse,
  DnsTraversalErrorResponse,
} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import Spinner from '../components/Spinner';
import {rootServers} from '../dnsConfig';
import {groupBy, map} from '../utils/maps';
import {sort as sortSet} from '../utils/sets';
import DnsTraversalLevel from '../components/DnsTraversalLevel';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}>;

export default function DnsTraversal(props: Props) {
  const {host, type: rawType} = props.match.params;
  const type = getLookupType(rawType);
  // TODO: Remove duplication with DnsLookup
  const queryString = useQueryString();
  const workers = useMemo(
    () => getWorkers(queryString, [Config.defaultWorker]),
    [queryString],
  );

  const request: DnsLookupRequest = useMemo(
    () => ({host, type, workers: Array.from(workers)}),
    [host, type, workers],
  );
  const data = useSignalrStream<WorkerResponse<DnsTraversalResponse>>(
    'dnstraversal',
    request,
  );

  let error: React.ReactNode = data.error && data.error.message;
  const responsesByLevel = groupResponsesByLevel(data.results);
  const serversByLevel = getServersByLevel(responsesByLevel);

  if (
    !error &&
    data.isComplete &&
    (responsesByLevel.get(1) || []).length === 0
  ) {
    // No responses at the first level and the request is complete... Something went wrong
    // when sending the request.
    const errorResult = data.results.find(
      (result): result is WorkerResponse<DnsTraversalErrorResponse> =>
        result.response.responseCase === DnsTraversalResponseType.Error,
    );
    if (errorResult) {
      error = (
        <>
          <strong>{errorResult.response.error.title}</strong>:{' '}
          {errorResult.response.error.message}
        </>
      );
    } else {
      error = 'An unknown error occurred';
    }
  }

  return (
    <>
      <Helmet>
        <title>DNS Traversal for {host}</title>
      </Helmet>
      <h1 className="main-header">
        DNS Traversal for {host} ({rawType}) {!data.isComplete && <Spinner />}
      </h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          ERROR: {error}
        </div>
      )}
      {!error &&
        Array.from(
          map(serversByLevel, (servers, level) => (
            <DnsTraversalLevel
              key={level}
              lookupType={type}
              responses={responsesByLevel.get(level) || []}
              servers={servers}
            />
          )).values(),
        )}
      <MainForm
        initialInput={{
          ...getDefaultInput(),
          host,
          dnsLookupType: type,
          worker: workers.values().next().value,
        }}
        initialSelectedTool={Tool.DnsTraversal}
        isStandalone={true}
      />
    </>
  );
}

function groupResponsesByLevel(
  results: ReadonlyArray<WorkerResponse<DnsTraversalResponse>>,
): ReadonlyMap<number, ReadonlyArray<DnsTraversalResponse>> {
  return groupBy(
    results
      .map(result => result.response)
      .sort((a, b) => {
        // First sort by level
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        // Then sort by server name
        return a.from.localeCompare(b.from);
      }),
    response => response.level,
  );
}

function getServersByLevel(
  responsesByLevel: ReadonlyMap<number, ReadonlyArray<DnsTraversalResponse>>,
): ReadonlyMap<number, ReadonlySet<string>> {
  const serversByLevel: Map<number, ReadonlySet<string>> = new Map([
    [1, rootServers],
  ]);
  responsesByLevel.forEach((responses, level) => {
    const serversAtThisLevel: Set<string> = new Set();
    responses.forEach(response => {
      if (
        response.responseCase === DnsTraversalResponseType.Reply &&
        response.reply.answers.length === 0
      ) {
        response.reply.authorities.forEach(authority => {
          if (authority.recordCase === DnsRecordType.Ns) {
            serversAtThisLevel.add(authority.ns.nsdname);
          }
        });
      }
    });
    if (serversAtThisLevel.size > 0) {
      serversByLevel.set(level + 1, sortSet(serversAtThisLevel));
    }
  });
  return serversByLevel;
}

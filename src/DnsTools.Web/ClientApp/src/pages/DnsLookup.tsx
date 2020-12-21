import React, {useMemo} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router';
import {Link} from 'react-router-dom';

import {
  DnsLookupType,
  DnsLookupRequest,
  WorkerResponse,
} from '../types/generated';
import {DnsLookupResponse} from '../types/protobuf';
import MainForm, {Tool, getDefaultInput} from '../components/MainForm';
import {getWorkers, getLookupType} from '../utils/queryString';
import useQueryString from '../hooks/useQueryString';
import useSignalrStream from '../hooks/useSignalrStream';
import Spinner from '../components/Spinner';
import DnsLookupResults from '../components/DnsLookupResults';
import {createRow} from '../components/DnsLookupWorkerResult';
import {groupResponsesByWorker} from '../utils/workers';
import Table, {Header} from '../components/Table';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}>;

const headers: ReadonlyArray<Header> = [
  {label: 'Location'},
  {label: 'Result', width: '40%'},
  {label: 'Server', onlyShowForLarge: true, width: '40%'},
];

export default function DnsLookup(props: Props) {
  const {host, type: rawType} = props.match.params;
  const type = getLookupType(rawType);
  const queryString = useQueryString();
  const workers = useMemo(() => getWorkers(queryString), [queryString]);
  const server = queryString.get('server') || undefined;

  const request: DnsLookupRequest = useMemo(
    () => ({host, server, type, workers: Array.from(workers)}),
    [host, server, type, workers],
  );
  const data = useSignalrStream<WorkerResponse<DnsLookupResponse>>(
    'dnslookup',
    request,
  );
  const workerResponses = groupResponsesByWorker(workers, data.results);

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
        <Table
          areRowsExpandable={true}
          headers={headers}
          defaultSortColumn="Location"
          isStriped={true}
          sections={[
            {
              rows: workerResponses.map((worker, index) =>
                createRow({
                  host,
                  index,
                  lookupType: type,
                  responses: worker.responses,
                  worker: worker.worker,
                }),
              ),
            },
          ]}
        />
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
            </Link>{' '}
            or try again from another location:
            <br />
          </p>

          <MainForm
            initialInput={{
              ...getDefaultInput(),
              host,
              dnsLookupType: type,
              server: server || '',
              workers,
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

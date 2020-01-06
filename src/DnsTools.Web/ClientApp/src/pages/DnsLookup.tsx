import React, {useMemo, useState} from 'react';
import {RouteComponentProps} from 'react-router';

import {
  Config,
  DnsLookupType,
  DnsLookupRequest,
  WorkerResponse,
  DnsLookupResponseType,
} from '../types/generated';
import {DnsLookupResponse} from '../types/protobuf';
import MainForm, {Tool, getDefaultInput} from '../components/MainForm';
import {getWorkers} from '../utils/queryString';
import useQueryString from '../hooks/useQueryString';
import useSignalrStream from '../hooks/useSignalrStream';
import Helmet from 'react-helmet';
import Spinner from '../components/Spinner';
import DnsRecordsTable from '../components/DnsRecordsTable';
import {Link} from 'react-router-dom';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}> & {
  config: Config;
};

export default function DnsLookup(props: Props) {
  const {host, type: rawType} = props.match.params;
  const type: DnsLookupType =
    DnsLookupType[rawType as keyof typeof DnsLookupType];
  const queryString = useQueryString();
  const workers = useMemo(
    () => getWorkers(props.config, queryString, [props.config.defaultWorker]),
    [props.config, queryString],
  );

  const request: DnsLookupRequest = useMemo(
    () => ({host, type, workers: Array.from(workers)}),
    [host, type, workers],
  );
  const data = useSignalrStream<WorkerResponse<DnsLookupResponse>>(
    'dnslookup',
    request,
  );

  const [showDetailsForReferral, setShowDetailsForReferral] = useState<
    ReadonlySet<string>
  >(() => new Set());

  return (
    <>
      <Helmet>
        <title>DNS Lookup for {host}</title>
      </Helmet>
      <h1 className="main-header">
        DNS Lookup for {host} {!data.isComplete && <Spinner />}
      </h1>
      {data.results.map(({response}) => {
        switch (response.responseCase) {
          case DnsLookupResponseType.Referral:
            const prevServerName = response.referral.prevServerName;
            const shouldShowDetails =
              prevServerName != null &&
              showDetailsForReferral.has(prevServerName);
            return (
              <>
                {prevServerName && (
                  <>
                    Got referral to {response.referral.nextServerName} [took{' '}
                    {response.duration} ms].{' '}
                    {response.referral.reply && (
                      <button
                        className="btn btn-link border-0 m-0 p-0"
                        type="button"
                        onClick={() => {
                          const newShowDetails = new Set(
                            showDetailsForReferral,
                          );
                          if (showDetailsForReferral.has(prevServerName)) {
                            newShowDetails.delete(prevServerName);
                          } else {
                            newShowDetails.add(prevServerName);
                          }
                          setShowDetailsForReferral(newShowDetails);
                        }}>
                        {shouldShowDetails ? 'Hide' : 'Show'} details
                      </button>
                    )}
                    {shouldShowDetails && response.referral.reply && (
                      <DnsRecordsTable
                        lookupType={type}
                        reply={response.referral.reply}
                      />
                    )}
                    <br />
                  </>
                )}
                Searching for {host} at {response.referral.nextServerName}:{' '}
              </>
            );

          case DnsLookupResponseType.Error:
            return (
              <>
                <strong className="text-danger">{response.error.title}</strong>
                <div className="alert alert-danger mt-2" role="alert">
                  {response.error.message}
                </div>
              </>
            );

          case DnsLookupResponseType.Reply:
            return (
              <>
                [took {response.duration} ms]
                <DnsRecordsTable lookupType={type} reply={response.reply} />
              </>
            );

          default:
            return <>Unknown response!</>;
        }
      })}
      {data.isComplete && (
        <>
          <p>
            These results are returned in real-time, and are not cached. This
            means that these results are what DNS servers all over the world are
            seeing at the moment.
            <br />
            <Link to={`/traversal/${host}/${rawType}/`}>
              See a DNS traversal
            </Link>
            .
          </p>

          <MainForm
            config={props.config}
            initialInput={{
              ...getDefaultInput(props.config),
              host,
              dnsLookupType: type,
              worker: workers.values().next().value,
            }}
            initialSelectedTool={Tool.DnsLookup}
            isStandalone={true}
          />
        </>
      )}
    </>
  );
}

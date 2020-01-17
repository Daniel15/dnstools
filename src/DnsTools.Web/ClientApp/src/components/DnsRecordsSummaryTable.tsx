import React from 'react';

import {DnsTraversalResponse} from '../types/protobuf';
import ShimmerBar from './ShimmerBar';
import {milliseconds} from '../utils/format';
import {DnsLookupType} from '../types/generated';
import DnsRecordsSummaryValues from './DnsRecordsSummaryValues';

type Props = Readonly<{
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsTraversalResponse>;
  serversToShow: ReadonlySet<string>;
}>;

/**
 * Shows a summarised list of DNS records obtained from multiple DNS servers (for traversals)
 */
export default function DnsRecordsSummaryTable(props: Props) {
  const responsesByServer = new Map(
    props.responses.map(response => [response.from, response]),
  );

  return (
    <table className="table table-striped mt-2 mb-4">
      <thead className="thead-default">
        <tr>
          <th style={{width: 200}}>Server</th>
          <th>Response</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(props.serversToShow).map(server => (
          <DnsRecordsSummaryTableRow
            key={server}
            lookupType={props.lookupType}
            server={server}
            response={responsesByServer.get(server)}
          />
        ))}
      </tbody>
    </table>
  );
}

function DnsRecordsSummaryTableRow(
  props: Readonly<{
    lookupType: DnsLookupType;
    response: DnsTraversalResponse | undefined;
    server: string;
  }>,
) {
  const {server, response} = props;
  return (
    <tr key={server}>
      <td>{server}</td>
      {response == null && (
        <td colSpan={2}>
          <ShimmerBar />
        </td>
      )}
      {response != null && (
        <>
          <td>
            <DnsRecordsSummaryValues
              lookupType={props.lookupType}
              response={response}
            />
          </td>
          <td>{milliseconds(response.duration)}</td>
        </>
      )}
    </tr>
  );
}

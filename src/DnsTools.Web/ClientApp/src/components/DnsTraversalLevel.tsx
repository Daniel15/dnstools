import React from 'react';

import {DnsTraversalResponse} from '../types/protobuf';
import DnsRecordsSummaryTable from '../components/DnsRecordsSummaryTable';
import {DnsLookupType} from '../types/generated';

type Props = Readonly<{
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsTraversalResponse>;
  servers: ReadonlySet<string>;
}>;
export default function DnsTraversalLevel(props: Props) {
  const serversLeft = props.servers.size - props.responses.length;

  // TODO: Don't show table if all records are the same across all servers
  // (just show the records once, and "all servers returned the same response")
  return (
    <div>
      Looking on {props.servers.size} servers...{' '}
      {serversLeft > 0 && <>{serversLeft} remaining</>}
      <DnsRecordsSummaryTable
        lookupType={props.lookupType}
        responses={props.responses}
        serversToShow={props.servers}
      />
    </div>
  );
}

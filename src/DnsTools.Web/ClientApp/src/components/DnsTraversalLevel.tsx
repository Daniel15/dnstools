import React from 'react';

import {DnsTraversalResponse, DnsRecord} from '../types/protobuf';
import DnsRecordsSummaryTable from '../components/DnsRecordsSummaryTable';
import {DnsLookupType, DnsTraversalResponseType} from '../types/generated';

type Props = Readonly<{
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsTraversalResponse>;
  servers: ReadonlySet<string>;
}>;
export default function DnsTraversalLevel(props: Props) {
  const serversLeft = props.servers.size - props.responses.length;

  const areSame = areAllResponsesSame(props.responses);

  // TODO: Don't show table if all records are the same across all servers
  // (just show the records once, and "all servers returned the same response")
  return (
    <div>
      Looking on {props.servers.size} servers...{' '}
      {serversLeft > 0 && <>{serversLeft} remaining</>}
      {props.responses.length > 0 && (
        <>
          {serversLeft === 0 && areSame && <>All returned the same response</>}
        </>
      )}
      {props.responses.length > 0 && !areSame && (
        <DnsRecordsSummaryTable
          lookupType={props.lookupType}
          responses={props.responses}
          serversToShow={props.servers}
        />
      )}
    </div>
  );
}

function areAllResponsesSame(
  responses: ReadonlyArray<DnsTraversalResponse>,
): boolean {
  if (responses.length === 0) {
    return false;
  }

  const firstResponse = responses[0];
  if (firstResponse.responseCase !== DnsTraversalResponseType.Reply) {
    return false;
  }

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    if (response.responseCase !== DnsTraversalResponseType.Reply) {
      return false;
    }
    if (
      !areAllRecordsSame(
        firstResponse.reply.answers || firstResponse.reply.authorities,
        response.reply.answers || response.reply.authorities,
      )
    ) {
      return false;
    }
  }

  return true;
}

function areAllRecordsSame(
  first: ReadonlyArray<DnsRecord>,
  second: ReadonlyArray<DnsRecord>,
): boolean {
  if (first.length !== second.length) {
    return false;
  }
  // This should probably be a smarter deep comparison, but this will do for now.
  return JSON.stringify(first) === JSON.stringify(second);
}

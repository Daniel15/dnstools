import React from 'react';

import {DnsLookupReply} from '../types/protobuf';
import {DnsLookupType} from '../types/generated';
import DnsRecordsTableRows from './DnsRecordsTableRows';

type Props = {
  lookupType: DnsLookupType;
  reply: DnsLookupReply;
};

export default function DnsRecordsTable({reply, lookupType}: Props) {
  return (
    <table className="table mt-2">
      <thead className="thead-default">
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>TTL</th>
          <th>Answer</th>
        </tr>
      </thead>
      {reply.answers && reply.answers.length > 0 && (
        <DnsRecordsTableRows lookupType={lookupType} records={reply.answers} />
      )}
      {reply.authorities && reply.authorities.length > 0 && (
        <>
          <thead>
            <tr>
              <th colSpan={4}>Authority</th>
            </tr>
          </thead>
          <DnsRecordsTableRows
            lookupType={lookupType}
            records={reply.authorities}
            rowClass="authority"
          />
        </>
      )}
      {reply.additionals && reply.additionals.length > 0 && (
        <>
          <thead>
            <tr>
              <th colSpan={4}>Additional</th>
            </tr>
          </thead>
          <DnsRecordsTableRows
            lookupType={lookupType}
            records={reply.additionals}
            rowClass="additional"
          />
        </>
      )}
    </table>
  );
}

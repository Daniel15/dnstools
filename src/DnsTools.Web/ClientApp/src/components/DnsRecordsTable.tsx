import React from 'react';

import {DnsLookupReply} from '../types/protobuf';
import {DnsLookupType} from '../types/generated';
import {createSection} from './DnsRecordsTableRows';
import Table, {Header, Section} from './Table';

type Props = {
  lookupType: DnsLookupType;
  reply: DnsLookupReply;
};

const headers: ReadonlyArray<Header> = [
  {label: 'Name'},
  {label: 'Type'},
  {label: 'TTL'},
  {label: 'Answer'},
];

export default function DnsRecordsTable({reply, lookupType}: Props) {
  const sections: Array<Section> = [];
  if (reply.answers && reply.answers.length) {
    sections.push(
      createSection({
        lookupType,
        records: reply.answers,
      }),
    );
  }

  if (reply.authorities && reply.authorities.length > 0) {
    sections.push(
      createSection({
        lookupType,
        records: reply.authorities,
        rowClass: 'authority',
        sectionTitle: 'Authority',
      }),
    );
  }

  if (reply.additionals && reply.additionals.length) {
    sections.push(
      createSection({
        lookupType,
        records: reply.additionals,
        rowClass: 'additional',
        sectionTitle: 'Additional',
      }),
    );
  }

  return (
    <div className="mt-2">
      <Table defaultSortColumn="Answer" headers={headers} sections={sections} />
    </div>
  );
}

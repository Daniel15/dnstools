import React from 'react';

import {DnsRecord} from '../types/protobuf';
import DnsRecordValue from './DnsRecordValue';
import {DnsLookupType, DnsRecordType} from '../types/generated';
import {duration as formatDuration} from '../utils/format';

type Props = {
  lookupType: DnsLookupType;
  records: ReadonlyArray<DnsRecord>;
  rowClass?: string;
};

export default function DnsRecordsTableRows(props: Props) {
  return (
    <tbody>
      {props.records.map(record => (
        <tr className={props.rowClass}>
          <td>{record.name}</td>
          <td>{DnsRecordType[record.recordCase].toUpperCase()}</td>
          <td>{formatDuration(record.ttl)}</td>
          <td>
            <DnsRecordValue lookupType={props.lookupType} record={record} />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

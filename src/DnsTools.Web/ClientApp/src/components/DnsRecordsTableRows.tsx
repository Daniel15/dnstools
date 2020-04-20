import React from 'react';

import {DnsRecord} from '../types/protobuf';
import DnsRecordValue, {getSortValue} from './DnsRecordValue';
import {DnsLookupType, DnsRecordType} from '../types/generated';
import {duration as formatDuration} from '../utils/format';
import {Section} from './Table';

type Props = {
  lookupType: DnsLookupType;
  records: ReadonlyArray<DnsRecord>;
  rowClass?: string;
  sectionTitle?: string;
};

export function createSection(props: Props): Section {
  return {
    title: props.sectionTitle,
    rows: props.records.map((record, index) => ({
      className: props.rowClass,
      columns: [
        {
          sortValue: record.name,
          value: record.name,
        },
        {
          sortValue: DnsRecordType[record.recordCase].toUpperCase(),
          value: DnsRecordType[record.recordCase].toUpperCase(),
        },
        {
          sortValue: record.ttl,
          value: formatDuration(record.ttl),
        },
        {
          sortValue: getSortValue(record),
          value: (
            <DnsRecordValue lookupType={props.lookupType} record={record} />
          ),
        },
      ],
      id: '' + index,
    })),
  };
}

import React from 'react';
import {DnsRecord} from '../types/protobuf';
import {DnsRecordType, DnsLookupType} from '../types/generated';
import {Link} from 'react-router-dom';
import {duration as formatDuration} from '../utils/format';

type Props = {
  lookupType: DnsLookupType;
  record: DnsRecord;
};
export default function DnsRecordValue(props: Props) {
  const {record} = props;
  switch (record.recordCase) {
    case DnsRecordType.A:
      return <>{record.a.address}</>;

    case DnsRecordType.Aaaa:
      return <>{record.aaaa.address}</>;

    case DnsRecordType.Caa:
      return <>{record.caa.value}</>;

    case DnsRecordType.Cname:
      return (
        <Link
          to={`/lookup/${record.cname.cname}/${
            DnsLookupType[props.lookupType]
          }/`}>
          {record.cname.cname}
        </Link>
      );

    case DnsRecordType.Mx:
      return (
        <>
          {record.mx.exchange} (priority {record.mx.preference})
        </>
      );

    case DnsRecordType.Ns:
      return <>{record.ns.nsdname}</>;

    case DnsRecordType.Ptr:
      return <>{record.ptr.ptrdname}</>;

    case DnsRecordType.Soa:
      return (
        <>
          Primary DNS server: {record.soa.mname}
          <br />
          Responsible name: {record.soa.rname}
          <br />
          Serial: {record.soa.serial}
          <br />
          Refresh: {formatDuration(record.soa.refresh)}
          <br />
          Retry: {formatDuration(record.soa.retry)}
          <br />
          Expire: {formatDuration(record.soa.expire)}
          <br />
          Minimum TTL: {formatDuration(record.soa.minimum)}
        </>
      );

    case DnsRecordType.Txt:
      return <>{record.txt.text}</>;

    default:
      return <strong className="text-danger">Unknown record type!</strong>;
  }
}

export function getSortValue(record: DnsRecord): string | null {
  switch (record.recordCase) {
    case DnsRecordType.A:
      return record.a.address;

    case DnsRecordType.Aaaa:
      return record.aaaa.address;

    case DnsRecordType.Caa:
      return record.caa.value;

    case DnsRecordType.Cname:
      return record.cname.cname;

    case DnsRecordType.Mx:
      return `${record.mx.exchange}-${record.mx.preference}`;

    case DnsRecordType.Ns:
      return record.ns.nsdname;

    case DnsRecordType.Ptr:
      return record.ptr.ptrdname;

    case DnsRecordType.Soa:
      return `${record.soa.mname}-${record.soa.rname}-${record.soa.serial}-${record.soa.refresh}-${record.soa.retry}-${record.soa.expire}-${record.soa.minimum}`;

    case DnsRecordType.Txt:
      return record.txt.text;

    default:
      return null;
  }
}

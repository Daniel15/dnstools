import React from 'react';
import {RouteComponentProps} from 'react-router';

import LegacyTool from '../components/LegacyTool';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}>;

export default function DnsLookup(props: Props) {
  const {host, type} = props.match.params;
  return (
    <LegacyTool
      title={`DNS Lookup for ${host}`}
      url={`lookup/${host}/${type.toUpperCase()}/`}
    />
  );
}

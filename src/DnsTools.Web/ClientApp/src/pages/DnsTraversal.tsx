import React from 'react';
import {RouteComponentProps} from 'react-router';

import LegacyTool from '../components/LegacyTool';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}>;

export default function DnsTraversal(props: Props) {
  const {host, type} = props.match.params;
  return (
    <LegacyTool
      title={`DNS Traversal for ${host}`}
      url={`traversal/${host}/${type.toUpperCase()}/`}
    />
  );
}

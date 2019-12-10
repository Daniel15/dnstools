import React from 'react';
import {RouteComponentProps} from 'react-router';

import LegacyTool from '../components/LegacyTool';
import {Config, DnsLookupType} from '../types/generated';
import {getDefaultInput, Tool} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}> & {
  config: Config;
};

export default function DnsTraversal(props: Props) {
  const {host, type: rawType} = props.match.params;
  const type: DnsLookupType =
    DnsLookupType[rawType as keyof typeof DnsLookupType];

  return (
    <LegacyTool
      config={props.config}
      initialInput={{
        ...getDefaultInput(props.config),
        host,
        dnsLookupType: type,
      }}
      initialSelectedTool={Tool.DnsTraversal}
      title={`DNS Traversal for ${host}`}
      url={`traversal/${host}/${rawType.toUpperCase()}/`}
    />
  );
}

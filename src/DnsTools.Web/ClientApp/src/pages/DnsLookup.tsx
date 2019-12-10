import React from 'react';
import {RouteComponentProps} from 'react-router';

import LegacyTool from '../components/LegacyTool';
import {Config, DnsLookupType} from '../types/generated';
import {Tool, getDefaultInput} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}> & {
  config: Config;
};

export default function DnsLookup(props: Props) {
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
      initialSelectedTool={Tool.DnsLookup}
      title={`DNS Lookup for ${host}`}
      url={`lookup/${host}/${rawType.toUpperCase()}/`}
    />
  );
}

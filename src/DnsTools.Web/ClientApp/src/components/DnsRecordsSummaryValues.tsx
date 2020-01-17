import React from 'react';

import {DnsTraversalResponse} from '../types/protobuf';
import {DnsTraversalResponseType, DnsLookupType} from '../types/generated';
import DnsRecordValue from './DnsRecordValue';
import {commaSeparate} from '../utils/react';

type Props = Readonly<{
  lookupType: DnsLookupType;
  response: DnsTraversalResponse;
}>;

/**
 * Renders a summary of all the values returned in the specified response.
 */
export default function DnsRecordsSummaryValues(props: Props) {
  const {response} = props;
  switch (response.responseCase) {
    case DnsTraversalResponseType.Error:
      return (
        <span className="text-danger">
          {response.error.title}: {response.error.message}
        </span>
      );

    case DnsTraversalResponseType.Reply:
      const records =
        response.reply.answers.length === 0
          ? response.reply.authorities
          : response.reply.answers;
      return commaSeparate(
        records.map((record, index) => (
          <DnsRecordValue
            key={index}
            lookupType={props.lookupType}
            record={record}
          />
        )),
      );
  }
  return <></>;
}

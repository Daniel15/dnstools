import React from 'react';
import {
  DnsLookupResponse,
  DnsLookupReplyResponse,
  DnsLookupErrorResponse,
  DnsLookupReferralResponse,
} from '../types/protobuf';
import {
  WorkerConfig,
  DnsLookupResponseType,
  DnsLookupType,
} from '../types/generated';
import WorkerLocation from './WorkerLocation';
import ShimmerBar from './ShimmerBar';
import {findLast} from '../utils/arrays';
import {commaSeparate} from '../utils/react';
import DnsRecordValue from './DnsRecordValue';

type Props = Readonly<{
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsLookupResponse>;
  worker: Readonly<WorkerConfig>;
}>;

export default function DnsLookupWorkerResult(props: Props) {
  console.log(props.responses);

  const lastReply = findLast(
    props.responses,
    (response): response is DnsLookupReplyResponse =>
      response.responseCase === DnsLookupResponseType.Reply,
  );
  const lastError = findLast(
    props.responses,
    (response): response is DnsLookupErrorResponse =>
      response.responseCase === DnsLookupResponseType.Error,
  );
  const lastReferral = findLast(
    props.responses,
    (response): response is DnsLookupReferralResponse =>
      response.responseCase === DnsLookupResponseType.Referral,
  );

  let value;
  if (lastError) {
    value = 'ERROR: ' + lastError.error.message;
  } else if (lastReply) {
    value = commaSeparate(
      lastReply.reply.answers.map((record, index) => (
        <DnsRecordValue
          key={index}
          lookupType={props.lookupType}
          record={record}
        />
      )),
    );
  } else {
    value = <ShimmerBar />;
  }

  return (
    <tr>
      <td className="align-middle">
        <WorkerLocation worker={props.worker} />
      </td>
      <td className="align-middle">{value}</td>
      <td className="align-middle">
        {lastReferral && lastReferral.referral.nextServerName}
      </td>
    </tr>
  );
}

import * as React from 'react';

import {
  DnsLookupResponse,
  DnsLookupReplyResponse,
  DnsLookupErrorResponse,
  DnsLookupReferralResponse,
} from '../types/protobuf';
import {DnsLookupResponseType, DnsLookupType} from '../types/generated';
import {WorkerConfig} from '../utils/workers';
import WorkerLocation from './WorkerLocation';
import ShimmerBar from './ShimmerBar';
import {findLast} from '../utils/arrays';
import {commaSeparate} from '../utils/react';
import DnsRecordValue, {getSortValue} from './DnsRecordValue';
import DnsLookupResults from './DnsLookupResults';
import {Row} from './Table';

type Props = Readonly<{
  host: string;
  index: number;
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsLookupResponse>;
  worker: Readonly<WorkerConfig>;
}>;

export function createRow(props: Props): Row {
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
  let sortValue = null;
  if (lastError) {
    value = 'ERROR: ' + lastError.error.message;
    // Always sort errors to the bottom
    sortValue = null;
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
    sortValue = lastReply.reply.answers
      .map(record => getSortValue(record))
      .join(',');
  } else {
    value = <ShimmerBar />;
  }

  return {
    id: props.worker.id,
    columns: [
      {
        expandOnClick: true,
        // Assume results are already sorted by server, and preserve their
        // original sort order.
        sortValue: props.index,
        value: <WorkerLocation worker={props.worker} />,
      },
      {
        sortValue,
        value,
      },
      {
        onlyShowForLarge: true,
        sortValue: lastReferral && lastReferral.referral.nextServerName,
        value: lastReferral && lastReferral.referral.nextServerName,
      },
    ],
    getExpandedContent: () => (
      <div style={{paddingBottom: '0.75rem'}}>
        <DnsLookupResults
          host={props.host}
          lookupType={props.lookupType}
          responses={props.responses}
        />
      </div>
    ),
  };
}

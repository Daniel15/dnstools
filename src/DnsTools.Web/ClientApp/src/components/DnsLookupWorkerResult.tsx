import * as React from 'react';
import {AlertFillIcon} from '@primer/octicons-react';

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
import {Column, Row} from './Table';
import WithHovercard from './WithHovercard';

type Props = Readonly<{
  anyRowHasRetry: boolean;
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
  const hasRetry = props.responses.some(
    response => response.responseCase === DnsLookupResponseType.Retry,
  );

  let value;
  let sortValue = null;
  if (lastError) {
    value =
      'ERROR: ' +
      (lastError.error.title == null || lastError.error.title === ''
        ? lastError.error.message
        : lastError.error.title);
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

  const columns: Array<Column> = [
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
  ];

  if (props.anyRowHasRetry) {
    columns.push({
      expandOnClick: true,
      onlyShowForLarge: true,
      sortValue: hasRetry ? 1 : 2,
      value: hasRetry ? (
        <WithHovercard tooltipBody="This lookup hit an error and was retried on a different server. Click to view details.">
          <AlertFillIcon fill="#f39c12" size={16} />
        </WithHovercard>
      ) : (
        ''
      ),
    });
  }

  return {
    id: props.worker.id,
    columns,
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

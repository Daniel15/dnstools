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
import ExpandTransition from './ExpandTransition';
import {ExpandChevron} from './icons/Icons';
import {Row} from './Table';

type Props = Readonly<{
  host: string;
  index: number;
  isExpanded: boolean;
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsLookupResponse>;
  worker: Readonly<WorkerConfig>;

  onClose: () => void;
  onExpand: () => void;
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
    // "zzzzzzz" is a hack to always sort errors to the bottom
    sortValue = `zzzzzzz ${lastError.error.message}`;
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

  const onToggle = props.isExpanded ? props.onClose : props.onExpand;

  return {
    classNameGetter: index => (index % 2 === 0 ? 'table-row-odd' : ''),
    id: props.worker.id,
    columns: [
      {
        className: 'expand-cell',
        onClick: onToggle,
        sortValue: null,
        value: <ExpandChevron isExpanded={props.isExpanded} />,
      },
      {
        // Assume results are already sorted by server, and preserve their
        // original sort order.
        sortValue: props.index,
        value: (
          <div onClick={onToggle}>
            <WorkerLocation worker={props.worker} />
          </div>
        ),
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
    getExtraContentAfterRow: index => (
      <tr
        aria-hidden={!props.isExpanded}
        className={`dns-detail-expanded ${
          index % 2 === 0 ? 'table-row-odd' : ''
        }`}>
        <td></td>
        <td colSpan={3}>
          <ExpandTransition
            isExpanded={props.isExpanded}
            style={{paddingBottom: '0.75rem'}}>
            <DnsLookupResults
              host={props.host}
              lookupType={props.lookupType}
              responses={props.responses}
            />
          </ExpandTransition>
        </td>
      </tr>
    ),
  };
}

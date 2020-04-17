import React, {memo, useState} from 'react';

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
import DnsRecordValue from './DnsRecordValue';
import DnsLookupResults from './DnsLookupResults';
import ExpandTransition from './ExpandTransition';
import {ExpandChevron} from './icons/Icons';

type Props = Readonly<{
  host: string;
  index: number;
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsLookupResponse>;
  worker: Readonly<WorkerConfig>;
}>;

export default memo(function DnsLookupWorkerResult(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const rowClass = props.index % 2 === 0 ? 'table-row-odd' : '';
  return (
    <>
      <tr className={rowClass}>
        <td
          className="align-middle expand-cell"
          onClick={() => setIsExpanded(value => !value)}>
          <ExpandChevron isExpanded={isExpanded} />
        </td>
        <td className="align-middle">
          <div onClick={() => setIsExpanded(value => !value)}>
            <WorkerLocation worker={props.worker} />
          </div>
        </td>
        <td className="align-middle">{value}</td>
        <td className="align-middle d-none d-lg-table-cell">
          {lastReferral && lastReferral.referral.nextServerName}
        </td>
      </tr>
      <tr
        aria-hidden={!isExpanded}
        className={`dns-detail-expanded ${rowClass}`}>
        <td></td>
        <td colSpan={3}>
          <ExpandTransition
            isExpanded={isExpanded}
            style={{paddingBottom: '0.75rem'}}>
            <DnsLookupResults
              host={props.host}
              lookupType={props.lookupType}
              responses={props.responses}
            />
          </ExpandTransition>
        </td>
      </tr>
    </>
  );
});

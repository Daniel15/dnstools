import React, {useState} from 'react';
import {useSpring, animated} from 'react-spring';
import Octicon, {ChevronRight} from '@primer/octicons-react';

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
import DnsLookupResults from './DnsLookupResults';
import useDimensions from '../hooks/useDimensions';

type Props = Readonly<{
  host: string;
  index: number;
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsLookupResponse>;
  worker: Readonly<WorkerConfig>;
}>;

const DETAILS_PADDING = 20;

export default function DnsLookupWorkerResult(props: Props) {
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

  const [detailsRef, detailsDimensions] = useDimensions<HTMLDivElement>();
  const animatedStyle = useSpring({
    from: {height: 0, opacity: 0},
    to: {
      height: isExpanded ? detailsDimensions.height + DETAILS_PADDING : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  const rowClass = props.index % 2 === 0 ? 'table-row-odd' : '';
  return (
    <>
      <tr className={rowClass}>
        <td
          className="align-middle expand-cell"
          onClick={() => setIsExpanded(value => !value)}>
          <Octicon
            ariaLabel={isExpanded ? 'Collapse' : 'Expand'}
            className={
              'expand-icon ' + (isExpanded ? 'expand-icon-expanded' : '')
            }
            icon={ChevronRight}
          />
        </td>
        <td className="align-middle">
          <div onClick={() => setIsExpanded(value => !value)}>
            <WorkerLocation worker={props.worker} />
          </div>
        </td>
        <td className="align-middle">{value}</td>
        <td className="align-middle">
          {lastReferral && lastReferral.referral.nextServerName}
        </td>
      </tr>
      <tr
        aria-hidden={!isExpanded}
        className={`dns-detail-expanded ${rowClass}`}>
        <td></td>
        <td colSpan={3}>
          <animated.div style={{overflow: 'hidden', ...animatedStyle}}>
            <div ref={detailsRef}>
              <DnsLookupResults
                host={props.host}
                lookupType={props.lookupType}
                responses={props.responses}
              />
            </div>
          </animated.div>
        </td>
      </tr>
    </>
  );
}

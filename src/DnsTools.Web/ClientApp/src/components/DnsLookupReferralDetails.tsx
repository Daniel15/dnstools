import React, {useState} from 'react';

import {DnsLookupType} from '../types/generated';
import {DnsLookupReferral} from '../types/protobuf';
import DnsRecordsTable from './DnsRecordsTable';
import ExpandTransition from './ExpandTransition';

type Props = Readonly<{
  lookupType: DnsLookupType;
  referral: DnsLookupReferral;
}>;

export default function DnsLookupReferralDetails(props: Props) {
  const [showDetails, setShowDetails] = useState(false);

  if (!props.referral.reply) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-link border-0 m-0 p-0"
        type="button"
        onClick={() => setShowDetails(value => !value)}>
        {showDetails ? 'Hide' : 'Show'} details
      </button>
      <ExpandTransition
        isExpanded={showDetails}
        style={{paddingBottom: '0.75rem'}}>
        <DnsRecordsTable
          lookupType={props.lookupType}
          reply={props.referral.reply}
        />
      </ExpandTransition>
    </>
  );
}

import React from 'react';

import {DnsLookupResponse} from '../types/protobuf';
import {DnsLookupResponseType, DnsLookupType} from '../types/generated';
import DnsRecordsTable from './DnsRecordsTable';
import DnsLookupReferralDetails from './DnsLookupReferralDetails';

type Props = Readonly<{
  host: string;
  responses: ReadonlyArray<DnsLookupResponse>;
  lookupType: DnsLookupType;
}>;

export default function DnsLookupResults(props: Props) {
  return (
    <>
      {props.responses.map((response, index) => {
        switch (response.responseCase) {
          case DnsLookupResponseType.Referral:
            const prevServerName = response.referral.prevServerName;
            return (
              <React.Fragment key={index}>
                {prevServerName && (
                  <>
                    Got referral to {response.referral.nextServerName} [took{' '}
                    {response.duration} ms].{' '}
                    <DnsLookupReferralDetails
                      lookupType={props.lookupType}
                      referral={response.referral}
                    />
                  </>
                )}
                Searching for {props.host} at {response.referral.nextServerName}
                :{' '}
              </React.Fragment>
            );

          case DnsLookupResponseType.Error:
            return (
              <React.Fragment key={index}>
                <strong className="text-danger">{response.error.title}</strong>
                <div className="alert alert-danger mt-2" role="alert">
                  {response.error.message}
                </div>
              </React.Fragment>
            );

          case DnsLookupResponseType.Reply:
            return (
              <React.Fragment key={index}>
                [took {response.duration} ms]
                <DnsRecordsTable
                  lookupType={props.lookupType}
                  reply={response.reply}
                />
              </React.Fragment>
            );

          default:
            return <>Unknown response!</>;
        }
      })}
    </>
  );
}

import React, {useState} from 'react';

import {DnsLookupResponse} from '../types/protobuf';
import {DnsLookupResponseType, DnsLookupType} from '../types/generated';
import DnsRecordsTable from '../components/DnsRecordsTable';

type Props = Readonly<{
  host: string;
  responses: ReadonlyArray<DnsLookupResponse>;
  lookupType: DnsLookupType;
}>;

export default function DnsLookupResults(props: Props) {
  const [showDetailsForReferral, setShowDetailsForReferral] = useState<
    ReadonlySet<string>
  >(() => new Set());

  return (
    <>
      {props.responses.map((response, index) => {
        switch (response.responseCase) {
          case DnsLookupResponseType.Referral:
            const prevServerName = response.referral.prevServerName;
            const shouldShowDetails =
              prevServerName != null &&
              showDetailsForReferral.has(prevServerName);
            return (
              <React.Fragment key={index}>
                {prevServerName && (
                  <>
                    Got referral to {response.referral.nextServerName} [took{' '}
                    {response.duration} ms].{' '}
                    {response.referral.reply && (
                      <button
                        className="btn btn-link border-0 m-0 p-0"
                        type="button"
                        onClick={() => {
                          const newShowDetails = new Set(
                            showDetailsForReferral,
                          );
                          if (showDetailsForReferral.has(prevServerName)) {
                            newShowDetails.delete(prevServerName);
                          } else {
                            newShowDetails.add(prevServerName);
                          }
                          setShowDetailsForReferral(newShowDetails);
                        }}>
                        {shouldShowDetails ? 'Hide' : 'Show'} details
                      </button>
                    )}
                    {shouldShowDetails && response.referral.reply && (
                      <DnsRecordsTable
                        lookupType={props.lookupType}
                        reply={response.referral.reply}
                      />
                    )}
                    <br />
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

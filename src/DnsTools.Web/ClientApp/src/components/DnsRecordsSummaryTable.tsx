import React from 'react';

import {DnsTraversalResponse} from '../types/protobuf';
import ShimmerBar from './ShimmerBar';
import {milliseconds} from '../utils/format';
import {DnsLookupType, DnsTraversalResponseType} from '../types/generated';
import Table, {Header, Row, Column} from './Table';
import {commaSeparate} from '../utils/react';
import DnsRecordValue, {getSortValue} from './DnsRecordValue';

type Props = Readonly<{
  lookupType: DnsLookupType;
  responses: ReadonlyArray<DnsTraversalResponse>;
  serversToShow: ReadonlySet<string>;
}>;

const headers: ReadonlyArray<Header> = [
  {label: 'Server', width: 200},
  {label: 'Response'},
  {label: 'Time', width: 90},
];

/**
 * Shows a summarised list of DNS records obtained from multiple DNS servers (for traversals)
 */
export default function DnsRecordsSummaryTable(props: Props) {
  const responsesByServer = new Map(
    props.responses.map(response => [response.from, response]),
  );

  return (
    <div className="mt-2 mb-4">
      <Table
        defaultSortColumn="Server"
        headers={headers}
        isStriped={true}
        sections={[
          {
            rows: Array.from(props.serversToShow).map((server, index) =>
              createRow(
                index,
                props.lookupType,
                responsesByServer.get(server),
                server,
              ),
            ),
          },
        ]}
      />
    </div>
  );
}

function createRow(
  rowIndex: number,
  lookupType: DnsLookupType,
  response: DnsTraversalResponse | undefined,
  server: string,
): Row {
  const columns: Array<Column> = [
    {
      value: server,
      // Assume results are already sorted by server, and preserve their
      // original sort order.
      sortValue: rowIndex,
    },
  ];
  if (response == null) {
    columns.push({
      colSpan: 2,
      value: <ShimmerBar />,
      sortValue: null,
    });
  } else {
    let value = null;
    let sortValue = null;
    switch (response.responseCase) {
      case DnsTraversalResponseType.Error:
        value = (
          <span className="text-danger">
            {response.error.title}: {response.error.message}
          </span>
        );
        // "zzzzzzz" is a hack to always sort errors to the bottom
        sortValue = `zzzzzzz ${response.error.title}: ${response.error.message}`;
        break;

      case DnsTraversalResponseType.Reply:
        const records =
          response.reply.answers.length === 0
            ? response.reply.authorities
            : response.reply.answers;
        value = commaSeparate(
          records.map((record, index) => (
            <DnsRecordValue
              key={index}
              lookupType={lookupType}
              record={record}
            />
          )),
        );
        sortValue = records.map(record => getSortValue(record)).join(',');
        break;
    }

    columns.push(
      {
        value,
        sortValue,
      },
      {
        value: milliseconds(response.duration),
        sortValue: response.duration,
      },
    );
  }
  return {
    columns,
    id: server,
  };
}

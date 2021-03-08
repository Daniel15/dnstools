import React from 'react';
import Table, {Header, Row} from './Table';
import IPDetails from './IPDetails';
import {MtrPosData} from '../pages/Mtr';
import {IpData, MtrPingLine} from '../types/generated';
import {countWhere, last} from '../utils/arrays';
import {milliseconds} from '../utils/format';
import {average, standardDeviation} from '../utils/math';

type Props = Readonly<{
  data: ReadonlyArray<MtrPosData>;
  ipData: ReadonlyMap<string, IpData>;
}>;

const headers: ReadonlyArray<Header> = [
  {label: ''},
  {label: 'Host'},
  {label: 'Loss'},
  {label: 'Sent'},
  {label: 'Last'},
  {label: 'Avg'},
  {label: 'Best'},
  {label: 'Worst'},
  {label: 'StdDev'},
];

export default function MtrTable(props: Props) {
  return (
    <Table
      areRowsExpandable={false}
      headers={headers}
      isStriped={true}
      sections={[
        {
          rows: props.data.map((data, index) =>
            createRow(data, index, props.ipData),
          ),
        },
      ]}
    />
  );
}

function createRow(
  data: MtrPosData,
  index: number,
  ipData: ReadonlyMap<string, IpData>,
): Row {
  const lastPing = last(data.responses);

  const stats = getPingStats(data.responses);
  // | || || |_
  const loss = calculateLossPercentage(data);

  return {
    id: '' + index,
    columns: [
      {
        sortValue: index + 1,
        value: index + 1,
      },
      {
        sortValue: data.ips.join(','),
        value:
          data.ips.length === 0 ? (
            <span className="text-muted">Waiting for reply...</span>
          ) : (
            data.ips.map(ip => (
              <div key={ip}>
                <IPDetails ip={ip} ipData={ipData.get(ip)} />
              </div>
            ))
          ),
      },
      {
        sortValue: loss,
        value: loss == null ? null : `${(loss * 100).toFixed(1)}%`,
      },
      {
        sortValue: data.transmits.length,
        value: data.transmits.length,
      },
      {
        // TODO: `lastPing?.rtt` once TypeScript + Babel are updated
        sortValue: lastPing ? lastPing.rtt : null,
        value: lastPing ? milliseconds(lastPing.rtt) : null,
      },
      {
        sortValue: stats ? stats.avg : null,
        value: stats ? milliseconds(stats.avg) : null,
      },
      {
        sortValue: stats ? stats.best : null,
        value: stats ? milliseconds(stats.best) : null,
      },
      {
        sortValue: stats ? stats.worst : null,
        value: stats ? milliseconds(stats.worst) : null,
      },
      {
        sortValue: stats ? stats.stdDev : null,
        value: stats ? milliseconds(stats.stdDev) : null,
      },
    ],
  };
}

function getPingStats(
  pings: ReadonlyArray<MtrPingLine>,
): Readonly<{
  avg: number;
  best: number;
  worst: number;
  stdDev: number;
}> | null {
  if (pings.length === 0) {
    return null;
  }

  const pingRTTs = pings.map(x => x.rtt);
  return {
    avg: average(pingRTTs),
    best: Math.min(...pingRTTs),
    worst: Math.max(...pingRTTs),
    stdDev: standardDeviation(pingRTTs),
  };
}

function calculateLossPercentage(data: MtrPosData): number | null {
  // If we're just starting out, show nothing
  if (data.transmits.length < 2 && data.responses.length === 0) {
    return null;
  }

  if (data.transmits.length === data.responses.length) {
    return 0;
  }

  // If we get here, a ping request could still be in progress. Exclude the most recent ping
  // from the count so the number doesn't keep jumping up and down.
  // TODO: This should use grace time rather than just excluding the most recent transmit
  const lastTransmit = last(data.transmits);

  const transmitsExcludingLast = countWhere(
    data.transmits,
    x => lastTransmit == null || x.seqnum !== lastTransmit.seqnum,
  );
  const responsesExcludingLast = countWhere(
    data.responses,
    x => lastTransmit == null || x.seqnum !== lastTransmit.seqnum,
  );

  const lost = transmitsExcludingLast - responsesExcludingLast;
  return lost / transmitsExcludingLast;
}

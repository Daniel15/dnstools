import {useEffect, useState} from 'react';

import {IpData} from '../types/generated';
import {HubConnection} from '@microsoft/signalr';

export default function useIpData(connection: HubConnection) {
  const [ips, setIPs] = useState<ReadonlyMap<string, IpData>>(new Map());
  useEffect(() => {
    connection.on('IpDataLoaded', (ip: string, newData: IpData) => {
      setIPs(ips => {
        const mergedData = {
          ...(ips.get(ip) || {}),
          ...newData,
        };

        const newIPs = new Map(ips);
        newIPs.set(ip, mergedData);
        return newIPs;
      });
    });

    return () => connection.off('IpDataLoaded');
  }, [connection]);

  return ips;
}

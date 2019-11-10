import {useEffect, useState} from 'react';

import useSignalrConnection from './useSignalrConnection';
import {IpData} from '../types/generated';

export default function useIpData() {
  const [ips, setIPs] = useState<ReadonlyMap<string, IpData>>(new Map());
  const connection = useSignalrConnection();
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
  }, []);

  return ips;
}

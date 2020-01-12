import {Protocol, Config, DnsLookupType} from '../types/generated';

export function getProtocol(queryString: URLSearchParams): Protocol {
  const rawProtocol = queryString.get('proto') || Protocol[Protocol.Any];
  const protocol: Protocol = Protocol[rawProtocol as keyof typeof Protocol];
  return protocol;
}

export function getWorkers(
  config: Config,
  queryString: URLSearchParams,
  def?: ReadonlyArray<string>,
): ReadonlySet<string> {
  const rawWorkers = queryString.get('workers');
  return new Set(
    rawWorkers
      ? rawWorkers.split(',')
      : def || config.workers.map(worker => worker.id),
  );
}

export function getLookupType(rawType: string): DnsLookupType {
  rawType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
  const type: DnsLookupType =
    DnsLookupType[rawType as keyof typeof DnsLookupType];
  if (!type) {
    throw new Error(`Invalid lookup type: ${rawType}`);
  }
  return type;
}

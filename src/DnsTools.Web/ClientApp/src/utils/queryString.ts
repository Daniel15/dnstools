import {Protocol, Config} from '../types/generated';

export function getProtocol(queryString: URLSearchParams): Protocol {
  const rawProtocol = queryString.get('proto') || Protocol[Protocol.Any];
  const protocol: Protocol = Protocol[rawProtocol as keyof typeof Protocol];
  return protocol;
}

export function getWorkers(
  config: Config,
  queryString: URLSearchParams,
): ReadonlySet<string> {
  const rawWorkers = queryString.get('workers');
  return new Set(
    rawWorkers
      ? rawWorkers.split(',')
      : config.workers.map(worker => worker.id),
  );
}

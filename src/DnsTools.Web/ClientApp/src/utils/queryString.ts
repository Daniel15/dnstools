import {Protocol, Config} from '../types/generated';

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

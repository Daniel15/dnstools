import {Protocol} from '../types/generated';

export function getProtocol(queryString: URLSearchParams): Protocol {
  const rawProtocol = queryString.get('proto') || Protocol[Protocol.Any];
  const protocol: Protocol = Protocol[rawProtocol as keyof typeof Protocol];
  return protocol;
}

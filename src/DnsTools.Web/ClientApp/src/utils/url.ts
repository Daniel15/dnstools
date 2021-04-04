import {LocationDescriptorObject} from 'history';
import {Tool, ToolInput} from '../components/MainForm';
import {defaultWorker, workers as WorkersConfig} from '../config';
import {Protocol, DnsLookupType} from '../types/generated';

export function buildToolURI({
  tool,
  input,
}: {
  tool: Tool;
  input: ToolInput;
}): LocationDescriptorObject {
  let uri;
  const params = new URLSearchParams();
  const hasMultipleHosts = input.hosts.length > 1;

  switch (tool) {
    case Tool.Ping:
      uri = hasMultipleHosts
        ? `/${input.worker}/ping/${input.hosts.join(',')}/`
        : `/ping/${input.hosts[0]}/`;
      break;

    case Tool.Traceroute:
      uri = `/traceroute/${input.hosts[0]}/`;
      break;

    case Tool.Mtr:
      uri = `/${input.worker}/mtr/${input.hosts[0]}/`;
      break;

    case Tool.DnsLookup:
      uri = `/lookup/${input.hosts[0]}/${DnsLookupType[
        input.dnsLookupType
      ].toUpperCase()}/`;
      break;

    case Tool.DnsTraversal:
      uri = `/traversal/${input.hosts[0]}/${DnsLookupType[
        input.dnsLookupType
      ].toUpperCase()}/`;
      break;

    case Tool.Whois:
      uri = `/whois/${input.hosts[0]}/`;
      break;
  }

  if (tool === Tool.Ping || tool === Tool.Traceroute || tool === Tool.Mtr) {
    if (input.protocol !== Protocol.Any) {
      params.append('proto', Protocol[input.protocol]);
    }
  }

  if (
    (tool === Tool.Ping && !hasMultipleHosts) ||
    tool === Tool.Traceroute ||
    tool === Tool.DnsLookup
  ) {
    if (input.workers.size < WorkersConfig.length) {
      params.append('workers', Array.from(input.workers).join(','));
    }
  }

  if (tool === Tool.DnsTraversal) {
    if (input.worker !== defaultWorker) {
      params.append('workers', input.worker);
    }
  }

  if (tool === Tool.DnsLookup) {
    const server = input.server.trim();
    if (input.server !== '') {
      params.append('server', server);
    }
  }

  const queryString = params.toString();
  return {
    pathname: uri,
    search: queryString === '' ? '' : '?' + queryString.replace(/%2C/g, ','),
  };
}

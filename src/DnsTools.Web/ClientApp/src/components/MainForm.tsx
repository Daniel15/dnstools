import {LocationDescriptorObject} from 'history';
import React, {useState, FormEvent} from 'react';
import {useHistory} from 'react-router';

import {Protocol, DnsLookupType, Config} from '../types/generated';
import CheckboxList from './form/CheckboxList';
import DropdownButton from './DropdownButton';
import FormRow from '../components/form/FormRow';
import RadioList from '../components/form/RadioList';
import {navigateWithReload} from '../utils/routing';
import CountryFlag from './CountryFlag';

type Props = {
  config: Config;
  initialSelectedTool?: Tool;
  initialInput?: ToolInput;
  isStandalone: boolean;
};

export enum Tool {
  DnsLookup = 'DnsLookup',
  DnsTraversal = 'DnsTraversal',
  ReverseDns = 'ReverseDns',
  Ping = 'Ping',
  Traceroute = 'Traceroute',
  Whois = 'Whois',
}

type ToolMetadata = {
  tool: Tool;
  label: string;
  description: string;
};

export type ToolInput = {
  dnsLookupType: DnsLookupType;
  host: string;
  protocol: Protocol;
  workers: ReadonlySet<string>;
};

const toolOptions: ReadonlyArray<ToolMetadata> = [
  {
    tool: Tool.DnsLookup,
    label: 'DNS Lookup',
    description: 'Look up a DNS record.',
  },
  {
    tool: Tool.DnsTraversal,
    label: 'DNS Traversal',
    description:
      'Shows every DNS server that is (or may be) used for a DNS lookup, and what the servers return.',
  },
  /*{
    tool: Tool.ReverseDns,
    label: 'Reverse DNS (PTR)',
    description: 'Convert an IP address into a hostname.',
  },*/
  {
    tool: Tool.Ping,
    label: 'Ping',
    description:
      'Show the round trip time (RTT) to a server, from {workerCount} locations around the world.',
  },
  {
    tool: Tool.Traceroute,
    label: 'Traceroute',
    description:
      'Show the route packets take to a particular host, from {workerCount} locations around the world.',
  },
  /*{
    tool: Tool.Whois,
    label: 'WHOIS',
    description: 'Get information on a domain name or IP address.',
  },*/
];

export function getDefaultInput(config: Config): ToolInput {
  return {
    dnsLookupType: DnsLookupType.A,
    host: '',
    protocol: Protocol.Any,
    workers: new Set(config.workers.map(worker => worker.id)),
  };
}

export default function MainForm(props: Props) {
  const [selectedTool, setSelectedTool] = useState<ToolMetadata>(() => {
    let initialTool = toolOptions.find(
      x => x.tool === props.initialSelectedTool,
    );
    if (!initialTool) {
      initialTool = toolOptions[0];
    }
    return initialTool;
  });
  const [hoveredTool, setHoveredTool] = useState<ToolMetadata | null>(null);
  const [input, setInput] = useState<ToolInput>(
    () => props.initialInput || getDefaultInput(props.config),
  );
  const history = useHistory();
  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    navigateWithReload(
      history,
      buildToolURI({config: props.config, tool: selectedTool.tool, input}),
    );
  }

  const description = (hoveredTool
    ? hoveredTool.description
    : selectedTool.description
  ).replace('{workerCount}', '' + props.config.workers.length);

  return (
    <form
      className={props.isStandalone ? 'jumbotron mt-5' : ''}
      onSubmit={onSubmit}>
      <FormRow id="host" label="Host">
        <input
          type="text"
          className="form-control"
          id="host"
          value={input.host}
          onChange={evt => setInput({...input, host: evt.target.value.trim()})}
        />
      </FormRow>
      <FormRow id="tool" isInput={false} label="Tool">
        <RadioList
          name="tool"
          options={toolOptions.map(tool => ({
            id: tool.tool,
            label: tool.label,
            value: tool,
          }))}
          selectedValue={selectedTool}
          onRadioMouseEnter={setHoveredTool}
          onRadioMouseLeave={() => setHoveredTool(null)}
          onSelect={setSelectedTool}
        />
        <br />
        <small>{description}</small>
      </FormRow>
      {(selectedTool.tool === Tool.Ping ||
        selectedTool.tool === Tool.Traceroute) && (
        <PingInput
          config={props.config}
          input={input}
          onChangeInput={setInput}
        />
      )}
      {(selectedTool.tool === Tool.DnsLookup ||
        selectedTool.tool === Tool.DnsTraversal) && (
        <DnsLookupInput input={input} onChangeInput={setInput} />
      )}
      <button className="btn btn-primary btn-lg" type="submit">
        Do it!
      </button>
    </form>
  );
}

function PingInput(props: {
  config: Config;
  input: ToolInput;
  onChangeInput: (input: ToolInput) => void;
}) {
  return (
    <>
      <FormRow id="protocol" isInput={false} label="Protocol">
        <RadioList
          name="protocol"
          options={[
            {
              id: 'protocol-any',
              label: 'Any',
              value: Protocol.Any,
            },
            {
              id: 'protocol-ipv4',
              label: 'IPv4',
              value: Protocol.Ipv4,
            },
            {
              id: 'protocol-ipv6',
              label: 'IPv6',
              value: Protocol.Ipv6,
            },
          ]}
          selectedValue={props.input.protocol}
          onSelect={value =>
            props.onChangeInput({...props.input, protocol: value})
          }
        />
      </FormRow>
      <Locations
        config={props.config}
        input={props.input}
        onChangeInput={props.onChangeInput}
      />
    </>
  );
}

function DnsLookupInput(props: {
  input: ToolInput;
  onChangeInput: (input: ToolInput) => void;
}) {
  return (
    <>
      <FormRow id="dns-lookup-type" label="Type">
        <select
          className="custom-select"
          id="dns-lookup-type"
          value={props.input.dnsLookupType}
          onChange={evt =>
            props.onChangeInput({
              ...props.input,
              dnsLookupType: +evt.target.value,
            })
          }>
          <option value={DnsLookupType.A}>A</option>
          <option value={DnsLookupType.Aaaa}>AAAA (IPv6)</option>
          <option value={DnsLookupType.Cname}>CNAME</option>
          <option value={DnsLookupType.Mx}>MX</option>
          <option value={DnsLookupType.Ptr}>PTR (Reverse DNS)</option>
          <option value={DnsLookupType.Ns}>NS</option>
          <option value={DnsLookupType.Txt}>TXT</option>
          <option value={DnsLookupType.Soa}>SOA</option>
        </select>
      </FormRow>
    </>
  );
}

function Locations(props: {
  config: Config;
  input: ToolInput;
  onChangeInput: (input: ToolInput) => void;
}) {
  let label = 'All';
  if (props.input.workers.size < props.config.workers.length) {
    const selectedWorkers = props.config.workers.filter(worker =>
      props.input.workers.has(worker.id),
    );
    label = selectedWorkers.map(worker => worker.location).join('; ');
  }

  return (
    <FormRow id="locations" label="Locations">
      <DropdownButton id="locations-dropdown" label={label}>
        <div className="px-3 py-2">
          <CheckboxList
            id="locations-list"
            options={props.config.workers
              .sort((a, b) => a.country.localeCompare(b.country))
              .map(worker => ({
                id: worker.id,
                label: (
                  <>
                    <CountryFlag country={worker.country} />
                    {worker.location}
                  </>
                ),
              }))}
            selectedOptions={props.input.workers}
            onChange={newWorkers =>
              props.onChangeInput({...props.input, workers: newWorkers})
            }
          />
        </div>
      </DropdownButton>
    </FormRow>
  );
}

function buildToolURI({
  config,
  tool,
  input,
}: {
  config: Config;
  tool: Tool;
  input: ToolInput;
}): LocationDescriptorObject {
  let uri;
  const params = new URLSearchParams();

  switch (tool) {
    case Tool.Ping:
      uri = `/ping/${input.host}/`;
      break;

    case Tool.Traceroute:
      uri = `/traceroute/${input.host}/`;
      break;

    case Tool.DnsLookup:
      uri = `/lookup/${input.host}/${DnsLookupType[input.dnsLookupType]}/`;
      break;

    case Tool.DnsTraversal:
      uri = `/traversal/${input.host}/${DnsLookupType[input.dnsLookupType]}/`;
      break;
  }

  if (tool === Tool.Ping || tool === Tool.Traceroute) {
    if (input.protocol !== Protocol.Any) {
      params.append('proto', Protocol[input.protocol]);
    }
    if (input.workers.size < config.workers.length) {
      params.append('workers', Array.from(input.workers).join(','));
    }
  }

  const queryString = params.toString();
  return {
    pathname: uri,
    search: queryString === '' ? '' : '?' + queryString.replace(/%2C/g, ','),
  };
}

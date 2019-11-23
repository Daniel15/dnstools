import React, {useState, FormEventHandler, FormEvent} from 'react';
import {Helmet} from 'react-helmet';
import {useHistory} from 'react-router';

import {Protocol} from '../types/generated';
import FormRow from '../components/form/FormRow';
import RadioList from '../components/form/RadioList';

enum Tool {
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

type ToolInput = {
  host: string;
  protocol: Protocol;
};

const toolOptions: ReadonlyArray<ToolMetadata> = [
  /*{
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
  {
    tool: Tool.ReverseDns,
    label: 'Reverse DNS (PTR)',
    description: 'Convert an IP address into a hostname.',
  },*/
  {
    tool: Tool.Ping,
    label: 'Ping',
    description: 'Show the round trip time (RTT) to a server.',
  },
  {
    tool: Tool.Traceroute,
    label: 'Traceroute',
    description: 'Show the route packets take to a particular host.',
  },
  /*{
    tool: Tool.Whois,
    label: 'WHOIS',
    description: 'Get information on a domain name or IP address.',
  },*/
];

export default function Index() {
  const [selectedTool, setSelectedTool] = useState<ToolMetadata>(
    toolOptions[0],
  );
  const [hoveredTool, setHoveredTool] = useState<ToolMetadata | null>(null);
  const [input, setInput] = useState<ToolInput>(() => ({
    host: '',
    protocol: Protocol.Any,
  }));
  const history = useHistory();

  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    history.push(buildToolURI(selectedTool.tool, input));
  }

  return (
    <>
      <Helmet>
        <title>Welcome to DNSTools!</title>
      </Helmet>
      <div className="jumbotron mt-5">
        <h1 className="display-4">Welcome to DNSTools!</h1>
        <form onSubmit={onSubmit}>
          <FormRow id="host" label="Host">
            <input
              type="text"
              className="form-control"
              id="host"
              value={input.host}
              onChange={evt =>
                setInput({...input, host: evt.target.value.trim()})
              }
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
            <small>
              {hoveredTool ? hoveredTool.description : selectedTool.description}
            </small>
          </FormRow>
          <PingInput input={input} onChangeInput={setInput} />
          <button className="btn btn-primary btn-lg" type="submit">
            Do it!
          </button>
        </form>
      </div>
    </>
  );
}

function PingInput(props: {
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
    </>
  );
}

function buildToolURI(tool: Tool, input: ToolInput): string {
  let uri;
  const params = new URLSearchParams();

  switch (tool) {
    case Tool.Ping:
      uri = `/ping/${input.host}`;
      if (input.protocol !== Protocol.Any) {
        params.append('proto', Protocol[input.protocol]);
      }
      break;

    case Tool.Traceroute:
      uri = `/traceroute/${input.host}`;
      if (input.protocol !== Protocol.Any) {
        params.append('proto', Protocol[input.protocol]);
      }
      break;
  }

  uri = uri || '';
  const queryString = params.toString();
  if (queryString !== '') {
    uri += '?' + queryString;
  }

  return uri;
}

import React, {useState, FormEvent} from 'react';
import {useHistory} from 'react-router';

import {Protocol, DnsLookupType} from '../types/generated';
import Config from '../config.json';
import CheckboxList, {Option} from './form/CheckboxList';
import DropdownButton from './DropdownButton';
import FormRow from '../components/form/FormRow';
import FormRowDropdownList from './form/FormRowDropdownList';
import RadioList from '../components/form/RadioList';
import {navigateWithReload} from '../utils/routing';
import CountryFlag from './CountryFlag';
import ToolSelector from './ToolSelector';
import PromotedServerProviders from './PromotedServerProviders';
import WithHovercard, {HovercardLocation} from './WithHovercard';
import {buildToolURI} from '../utils/url';

type Props = {
  initialSelectedTool?: Tool;
  initialInput?: ToolInput;
  isLoading?: boolean;
  isStandalone: boolean;
  showSecondaryFooter?: boolean;
};

export enum Tool {
  DnsLookup = 'DnsLookup',
  DnsTraversal = 'DnsTraversal',
  Mtr = 'Mtr',
  Ping = 'Ping',
  Traceroute = 'Traceroute',
  Whois = 'Whois',
}

export type ToolMetadata = {
  tool: Tool;
  label: string;
  isNew?: boolean;
  description: string;
};

export type ToolInput = {
  dnsLookupType: DnsLookupType;
  hosts: ReadonlyArray<string>;
  protocol: Protocol;
  server: string;
  // For tools that allow selection of multiple workers
  workers: ReadonlySet<string>;
  // For tools that only allow one worker
  worker: string;
};

const toolOptions: ReadonlyArray<ToolMetadata> = [
  {
    tool: Tool.DnsLookup,
    label: 'DNS Lookup',
    description:
      'Look up a DNS record from {workerCount} locations around the world.',
  },
  {
    tool: Tool.DnsTraversal,
    label: 'DNS Traversal',
    description:
      'Shows every DNS server that is (or may be) used for a DNS lookup, and what the servers return.',
  },
  {
    tool: Tool.Mtr,
    label: 'MTR',
    isNew: true,
    description: 'Show the route packets take to a particular host',
  },
  // {
  //   tool: Tool.ReverseDns,
  //   label: 'Reverse DNS (PTR)',
  //   description: 'Convert an IP address into a hostname.',
  // },
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
  {
    tool: Tool.Whois,
    label: 'WHOIS',
    description: 'Get information on a domain name or IP address.',
  },
];

export function getDefaultInput(): ToolInput {
  return {
    dnsLookupType: DnsLookupType.A,
    hosts: [''],
    protocol: Protocol.Any,
    server: '',
    workers: new Set(Config.workers.map(worker => worker.id)),
    worker: Config.defaultWorker,
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
  const [input, setInput] = useState<ToolInput>(
    () => props.initialInput || getDefaultInput(),
  );
  const history = useHistory();
  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    navigateWithReload(history, buildToolURI({tool: selectedTool.tool, input}));
  }

  const workerOptions = Config.workers.map(worker => ({
    id: worker.id,
    label: (
      <>
        <CountryFlag country={worker.country} />
        {worker.locationDisplay}
      </>
    ),
  }));

  return (
    <>
      <form
        className={props.isStandalone ? 'jumbotron mt-5' : ''}
        onSubmit={onSubmit}>
        <FormRow id="tool" isInput={false} label="Tool">
          <ToolSelector
            selectedTool={selectedTool}
            toolOptions={toolOptions}
            onSelectTool={setSelectedTool}
          />
        </FormRow>
        <HostInput
          input={input}
          tool={selectedTool.tool}
          onChangeInput={setInput}
        />
        {(selectedTool.tool === Tool.Ping ||
          selectedTool.tool === Tool.Traceroute ||
          selectedTool.tool === Tool.Mtr) && (
          <PingInput
            input={input}
            tool={selectedTool.tool}
            onChangeInput={setInput}
            workerOptions={workerOptions}
          />
        )}
        {(selectedTool.tool === Tool.DnsLookup ||
          selectedTool.tool === Tool.DnsTraversal) && (
          <DnsLookupInput
            input={input}
            onChangeInput={setInput}
            tool={selectedTool.tool}
            workerOptions={workerOptions}
          />
        )}
        <button
          className="btn btn-primary btn-lg"
          disabled={
            props.isLoading ||
            (input.hosts.length === 1 && input.hosts[0] === '')
          }
          type="submit">
          {props.isLoading ? 'Loading...' : 'Do it!'}
        </button>
      </form>
      <p className="mt-3">
        <small>
          &copy; 2007-2021 <a href="https://d.sb/">Daniel15</a>. Send feedback
          to <a href="mailto:feedback@dns.tg">feedback@dns.tg</a>.{' '}
          <a href="https://github.com/Daniel15/dnstools">I'm open-source!</a>
        </small>
      </p>
      {props.showSecondaryFooter && (
        <div className="mt-3">
          <small>
            Server hosting sponsored by <PromotedServerProviders />.
          </small>
        </div>
      )}
    </>
  );
}

function HostInput(
  props: Readonly<{
    input: ToolInput;
    onChangeInput: (input: ToolInput) => void;
    tool: Tool;
  }>,
) {
  const [wasExpanded, setWasExpanded] = useState(false);
  const shouldAllowMultipleHosts = props.tool === Tool.Ping;
  const hasMultipleHosts = wasExpanded || props.input.hosts.length > 1;
  if (!shouldAllowMultipleHosts || !hasMultipleHosts) {
    return (
      <FormRow id="host" label="Host">
        <div className="d-flex">
          <input
            type="text"
            className="form-control"
            id="host"
            value={props.input.hosts[0]}
            onChange={evt => {
              props.onChangeInput({
                ...props.input,
                hosts: [evt.target.value.trim()],
              });
            }}
          />
          {shouldAllowMultipleHosts && (
            <WithHovercard
              location={HovercardLocation.Top}
              tooltipBody={
                <>
                  New: Ping multiple different hosts from one location. Enter
                  one host name per line
                </>
              }>
              <button
                className="btn btn-primary ml-2"
                type="button"
                onClick={() => setWasExpanded(true)}>
                +&nbsp;Multiple&nbsp;Hosts
              </button>
            </WithHovercard>
          )}
        </div>
      </FormRow>
    );
  }

  return (
    <FormRow id="host" label="Hosts">
      <textarea
        aria-describedby="multi-host-desc"
        className="form-control"
        id="host"
        rows={3}
        style={{height: 150}}
        value={props.input.hosts.join('\n')}
        onBlur={() => {
          // Remove empty lines on blur
          props.onChangeInput({
            ...props.input,
            hosts: props.input.hosts.filter(x => Boolean(x)),
          });
        }}
        onChange={evt => {
          props.onChangeInput({
            ...props.input,
            hosts: evt.target.value.split('\n').map(x => x.trim()),
          });
        }}
      />
      <small id="multi-host-desc" className="form-text text-muted">
        Enter one hostname per line
      </small>
    </FormRow>
  );
}

function PingInput(props: {
  input: ToolInput;
  tool: Tool;
  onChangeInput: (input: ToolInput) => void;
  workerOptions: ReadonlyArray<Option>;
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
        allowMultiSelect={
          props.tool !== Tool.Mtr && props.input.hosts.length === 1
        }
        input={props.input}
        onChangeInput={props.onChangeInput}
        workerOptions={props.workerOptions}
      />
    </>
  );
}

function DnsLookupInput(props: {
  input: ToolInput;
  onChangeInput: (input: ToolInput) => void;
  tool: Tool;
  workerOptions: ReadonlyArray<Option>;
}) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(() =>
    isUsingAdvancedOptions(props.input),
  );
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
      <Locations
        allowMultiSelect={props.tool !== Tool.DnsTraversal}
        input={props.input}
        onChangeInput={props.onChangeInput}
        workerOptions={props.workerOptions}
      />
      {props.tool !== Tool.DnsTraversal && (
        <>
          {!showAdvancedOptions && (
            <div>
              <button
                className="btn btn-link border-0 m-0 mb-3 p-0"
                type="button"
                onClick={() => setShowAdvancedOptions(true)}>
                Show advanced options
              </button>
            </div>
          )}
          {showAdvancedOptions && (
            <FormRow id="server" label="Server">
              <input
                aria-describedby="server-desc"
                type="text"
                className="form-control"
                id="server"
                value={props.input.server}
                onChange={evt =>
                  props.onChangeInput({
                    ...props.input,
                    server: evt.target.value.trim(),
                  })
                }
              />
              <small id="server-desc" className="form-text text-muted">
                Advanced: Name server to query. If not provided, will use root
                servers.
              </small>
            </FormRow>
          )}
        </>
      )}
    </>
  );
}

function Locations(props: {
  allowMultiSelect: boolean;
  input: ToolInput;
  onChangeInput: (input: ToolInput) => void;
  workerOptions: ReadonlyArray<Option>;
}) {
  if (!props.allowMultiSelect) {
    return (
      <FormRowDropdownList
        label="From"
        options={props.workerOptions}
        selectedItem={props.input.worker}
        onSelect={newWorker =>
          props.onChangeInput({
            ...props.input,
            worker: newWorker || Config.defaultWorker,
          })
        }
      />
    );
  }
  let label = 'All';
  if (props.input.workers.size < Config.workers.length) {
    const selectedWorkers = Config.workers.filter(worker =>
      props.input.workers.has(worker.id),
    );
    label = selectedWorkers.map(worker => worker.locationDisplay).join('; ');
  }

  return (
    <FormRow id="locations" label="Locations">
      <DropdownButton id="locations-dropdown" label={label}>
        <div className="px-3 py-2">
          <CheckboxList
            id="locations-list"
            options={props.workerOptions}
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

function isUsingAdvancedOptions(input: ToolInput): boolean {
  return input.server !== '';
}

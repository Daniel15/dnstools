import React, {useMemo} from 'react';
import {RouteComponentProps} from 'react-router';
import Helmet from 'react-helmet';

import {
  IpData,
  ITracerouteRequest,
  TracerouteResponseType,
  WorkerResponse,
  Config,
} from '../types/generated';
import {TracerouteResponse} from '../types/protobuf';
import useSignalrStream from '../hooks/useSignalrStream';
import ReactTracerouteResponse from '../components/TracerouteResponse';
import groupResponsesByWorker from '../groupResponsesByWorker';
import CountryFlag from '../components/CountryFlag';
import Spinner from '../components/Spinner';
import useQueryString from '../hooks/useQueryString';
import {getProtocol} from '../utils/queryString';
import MainForm, {defaultInput, Tool} from '../components/MainForm';

type Props = RouteComponentProps<{
  host: string;
}> & {
  ipData: ReadonlyMap<string, IpData>;
  config: Config;
};

export default function Traceroute(props: Props) {
  const host = props.match.params.host;
  const queryString = useQueryString();
  const protocol = getProtocol(queryString);

  const request: ITracerouteRequest = useMemo(() => ({host, protocol}), [
    host,
    protocol,
  ]);
  const data = useSignalrStream<WorkerResponse<TracerouteResponse>>(
    'traceroute',
    request,
  );
  const workerResponses = groupResponsesByWorker(
    props.config.workers,
    data.results,
  );

  return (
    <>
      <Helmet>
        <title>Traceroute to {host}</title>
      </Helmet>
      <h1 className="main-header">
        Traceroute {host} {!data.isComplete && <Spinner />}
      </h1>
      <div className="card-deck">
        {workerResponses.map(worker => (
          <div className="card">
            <div className="card-header">
              <CountryFlag country={worker.worker.country} />
              {worker.worker.location}
            </div>
            <ul className="list-group list-group-flush">
              {worker.responses.map((response, index) => {
                const ipData =
                  response.responseCase === TracerouteResponseType.Reply
                    ? props.ipData.get(response.reply.ip)
                    : undefined;

                return (
                  <ReactTracerouteResponse
                    index={index}
                    ipData={ipData}
                    key={index}
                    response={response}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {data.isComplete && (
        <MainForm
          config={props.config}
          initialInput={{
            ...defaultInput,
            host,
            protocol,
          }}
          initialSelectedTool={Tool.Traceroute}
          isStandalone={true}
        />
      )}
    </>
  );
}

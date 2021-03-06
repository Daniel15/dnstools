import React from 'react';

import {
  IpData,
  ITracerouteReply,
  TracerouteResponseType,
} from '../types/generated';
import IPDetails from './IPDetails';
import {milliseconds} from '../utils/format';
import {TracerouteResponse as TracerouteResponseData} from '../types/protobuf';

type Props = {
  index: number;
  ipData?: IpData | undefined;
  isFinalReply: boolean;
  response: TracerouteResponseData;
};

export default function TracerouteResponse(props: Props) {
  const {response} = props;
  let seq = props.index + 1;
  let contents;
  switch (response.responseCase) {
    case TracerouteResponseType.Reply:
      contents = (
        <TracerouteReply
          ipData={props.ipData}
          isFinalReply={props.isFinalReply}
          reply={response.reply}
        />
      );
      seq = response.reply.seq;
      break;

    case TracerouteResponseType.Error:
      contents = <p>Error: {response.error.message}</p>;
      break;

    case TracerouteResponseType.Timeout:
      contents = <p>Timed Out</p>;
      seq = response.timeout.seq;
      break;
  }

  return (
    <li className={`list-group-item ${props.isFinalReply ? 'active' : ''}`}>
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">{contents}</div>
        <span className="tracert-seq mr-2">{seq}</span>
      </div>
    </li>
  );
}

type ReplyProps = {
  ipData: IpData | undefined;
  isFinalReply: boolean;
  reply: ITracerouteReply;
};

function TracerouteReply(props: ReplyProps) {
  const {ipData, reply} = props;
  return (
    <>
      <span
        className={`badge ${
          props.isFinalReply ? 'badge-info' : 'badge-secondary'
        }`}>
        {milliseconds(reply.rtt)}
      </span>{' '}
      <IPDetails ip={reply.ip} ipData={ipData} />
    </>
  );
}

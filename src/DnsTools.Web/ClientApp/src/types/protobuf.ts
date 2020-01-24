import {
  PingResponseType,
  IPingReply,
  IPingTimeout,
  IPingSummary,
  IError,
  TracerouteResponseType,
  ITracerouteReply,
  IHostLookupResult,
  DnsRecordType,
  IDnsARecord,
  IDnsAAAARecord,
  IDnsCAARecord,
  IDnsCNAMERecord,
  IDnsMXRecord,
  IDnsNSRecord,
  IDnsPTRRecord,
  IDnsSOARecord,
  IDnsTXTRecord,
  DnsLookupResponseType,
  DnsTraversalResponseType,
} from './generated';

export type PingHostLookupResponse = {
  responseCase: PingResponseType.Lookup;
  lookup: IHostLookupResult;
};

export type PingResponse =
  | PingHostLookupResponse
  | {
      responseCase: PingResponseType.Reply;
      reply: IPingReply;
    }
  | {
      responseCase: PingResponseType.Timeout;
      timeout: IPingTimeout;
    }
  | {
      responseCase: PingResponseType.Summary;
      summary: IPingSummary;
    }
  | {
      responseCase: PingResponseType.Error;
      error: IError;
    };

export type TracerouteResponse =
  | {
      responseCase: TracerouteResponseType.Lookup;
      lookup: IHostLookupResult;
    }
  | {
      responseCase: TracerouteResponseType.Reply;
      reply: ITracerouteReply;
    }
  | {
      responseCase: TracerouteResponseType.Timeout;
      timeout: IPingTimeout;
    }
  | {
      responseCase: TracerouteResponseType.Error;
      error: IError;
    }
  | {
      responseCase: TracerouteResponseType.Completed;
    };

export type DnsRecord = {
  name: string;
  ttl: number;
} & (
  | {
      recordCase: DnsRecordType.A;
      a: IDnsARecord;
    }
  | {
      recordCase: DnsRecordType.Aaaa;
      aaaa: IDnsAAAARecord;
    }
  | {
      recordCase: DnsRecordType.Caa;
      caa: IDnsCAARecord;
    }
  | {
      recordCase: DnsRecordType.Cname;
      cname: IDnsCNAMERecord;
    }
  | {
      recordCase: DnsRecordType.Mx;
      mx: IDnsMXRecord;
    }
  | {
      recordCase: DnsRecordType.Ns;
      ns: IDnsNSRecord;
    }
  | {
      recordCase: DnsRecordType.Ptr;
      ptr: IDnsPTRRecord;
    }
  | {
      recordCase: DnsRecordType.Soa;
      soa: IDnsSOARecord;
    }
  | {
      recordCase: DnsRecordType.Txt;
      txt: IDnsTXTRecord;
    }
);

export type DnsLookupReply = {
  from: string;
  answers: ReadonlyArray<DnsRecord>;
  authorities: ReadonlyArray<DnsRecord>;
  additionals: ReadonlyArray<DnsRecord>;
};

export type DnsLookupReferral = {
  nextServerName: string;
  nextServerIp: string;
  prevServerName: string | undefined;
  prevServerIp: string | undefined;
  reply: DnsLookupReply | undefined;
};

export type DnsLookupResponseSharedFields = {
  duration: number;
};

export type DnsLookupReplyResponse = DnsLookupResponseSharedFields & {
  responseCase: DnsLookupResponseType.Reply;
  reply: DnsLookupReply;
};

export type DnsLookupErrorResponse = DnsLookupResponseSharedFields & {
  responseCase: DnsLookupResponseType.Error;
  error: IError;
};

export type DnsLookupReferralResponse = DnsLookupResponseSharedFields & {
  responseCase: DnsLookupResponseType.Referral;
  referral: DnsLookupReferral;
};

export type DnsLookupResponse =
  | DnsLookupReplyResponse
  | DnsLookupErrorResponse
  | DnsLookupReferralResponse;

type DnsTraversalResponseSharedFields = {
  from: string;
  level: number;
  duration: number;
};

export type DnsTraversalErrorResponse = DnsTraversalResponseSharedFields & {
  responseCase: DnsTraversalResponseType.Error;
  error: IError;
};

export type DnsTraversalResponse = DnsTraversalResponseSharedFields &
  (
    | {
        responseCase: DnsTraversalResponseType.Reply;
        reply: DnsLookupReply;
      }
    | DnsTraversalErrorResponse
  );

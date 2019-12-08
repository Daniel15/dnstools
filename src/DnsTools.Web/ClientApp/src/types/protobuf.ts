import {
  PingResponseType,
  IPingReply,
  IPingTimeout,
  IPingSummary,
  IError,
  TracerouteResponseType,
  ITracerouteReply,
  IHostLookupResult,
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

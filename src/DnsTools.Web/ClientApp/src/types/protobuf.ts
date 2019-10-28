import {
  PingResponseType,
  IPingReply,
  IPingTimeout,
  IPingSummary,
  IError,
} from './generated';

export type PingResponse =
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

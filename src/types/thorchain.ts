import { RequestMethod } from "../utils/constants";
import { Messaging } from "../utils/interfaces";

export type ThorchainRequest = {
  method: RequestMethod.THORCHAIN;
  params: ThorchainRequestParams[RequestMethod.THORCHAIN];
};

export type ThorchainRequestParams = {
  [RequestMethod.THORCHAIN.REQUEST_ACCOUNTS]: never[];
  [RequestMethod.THORCHAIN.GET_ACCOUNTS]: never[];
  [RequestMethod.THORCHAIN.SEND_TRANSACTION]: any[]; // TODO: type THOR payloads
  [RequestMethod.THORCHAIN.DEPOSIT_TRANSACTION]: any[]; // TODO: type THOR payloads
  [RequestMethod.THORCHAIN.GET_TRANSACTION_BY_HASH]: {
    hash: string;
  }[];
};

// TODO: type THOR responses
export type ThorchainResponse = Messaging.Chain.Response;

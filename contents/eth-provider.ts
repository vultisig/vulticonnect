import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

enum Method {
  ACCOUNTS = "eth_accounts",
  CALL = "eth_call",
  CHAINID = "eth_chainId",
  GET_BALANCE = "eth_getBalance",
  REQUEST_ACCOUNTS = "eth_requestAccounts",
  SEND_TRANSACTION = "eth_sendTransaction",
  SIGN = "eth_sign",
}

enum Event {
  ACCOUNTS_CHANGED = "ACCOUNTS_CHANGED",
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  ERROR = "ERROR",
  MESSAGE = "MESSAGE",
}

type RequestArguments = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

type BaseProviderState = {
  accounts: string[];
  chainId: string;
  isConnected: boolean;
};

interface EthereumProvider {
  isMetaMask: boolean;
  _events: Record<string, Function[]>;
  _state: BaseProviderState;
  enable(): Promise<string[]>;
  isConnected(): boolean;
  on(event: string, callback: (data: any) => void): void;
  request(args: RequestArguments): Promise<string | string[]>;
  removeListener(event: string, callback: Function): void;
  _emit(event: string, data: any): void;
  _connect(): void;
  _disconnect(error?: { code: number; message: string }): void;
}

const ethereumProvider: EthereumProvider = {
  isMetaMask: false,

  _state: {
    accounts: [],
    chainId: "0x1",
    isConnected: false,
  },
  _events: {},

  isConnected: () => ethereumProvider._state.isConnected,

  request: ({ method, params }) => {
    return new Promise((resolve, reject) => {
      switch (method) {
        case Method.REQUEST_ACCOUNTS: {
          sendToBackgroundViaRelay({ name: "eth-accounts" })
            .then((accounts) => {
              ethereumProvider._state.accounts = accounts;

              resolve(ethereumProvider._state.accounts);
            })
            .catch(reject);

          break;
        }
        case Method.CHAINID: {
          resolve(ethereumProvider._state.chainId);

          break;
        }
        case Method.ACCOUNTS: {
          resolve(ethereumProvider._state.accounts);

          break;
        }
        case Method.SEND_TRANSACTION: {
          ethereumProvider._emit(Event.MESSAGE, {
            type: Method.SEND_TRANSACTION,
            data: params,
          });

          resolve("0xMockTransactionHash");

          break;
        }
        case Method.SIGN: {
          resolve("0xMockSignature");

          break;
        }
        case Method.CALL: {
          resolve("0x");

          break;
        }
        case Method.GET_BALANCE: {
          resolve("0xDE0B6B3A7640000");

          break;
        }
        default: {
          ethereumProvider._emit(
            Event.ERROR,
            new Error(`Unsupported method: ${method}`)
          );

          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    });
  },

  on: (event, callback) => {
    if (!ethereumProvider._events[event]) ethereumProvider._events[event] = [];

    ethereumProvider._events[event].push(callback);

    // if (event === Event.CONNECT && ethereumProvider.isConnected()) {
    //   callback({ chainId: ethereumProvider._state.chainId });
    // } else {
    //   ethereumProvider._events[event].push(callback);
    // }

    return;
  },

  removeListener: (event, callback) => {
    const listeners = ethereumProvider._events[event];

    if (!listeners) return;

    ethereumProvider._events[event] = listeners.filter(
      (listener) => listener !== callback
    );
  },

  enable: () => {
    return new Promise((resolve, reject) => {
      ethereumProvider
        .request({
          method: Method.REQUEST_ACCOUNTS,
          params: {},
        })
        .then((accounts) => {
          Array.isArray(accounts) ? resolve(accounts) : reject();
        })
        .catch(reject);
    });
  },

  _emit: (event, data) => {
    const listeners = ethereumProvider._events[event];

    if (listeners && listeners.length > 0) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  },

  _connect: () => {
    ethereumProvider._state.isConnected = true;

    ethereumProvider._emit(Event.CONNECT, {
      chainId: ethereumProvider._state.chainId,
    });
  },

  _disconnect: (error) => {
    ethereumProvider._state.isConnected = false;

    ethereumProvider._emit(
      Event.DISCONNECT,
      error || { code: 4900, message: "Provider disconnected" }
    );
  },
};

ethereumProvider._connect();

window.ethereum = ethereumProvider;

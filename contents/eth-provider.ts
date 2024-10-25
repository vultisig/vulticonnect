import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { type EIP1193Provider, announceProvider } from "mipd";
import { RequestMethod } from "~utils/constants";
import type { Messaging } from "~utils/interfaces";

import { v4 as uuidv4 } from "uuid";
import { VULTI_ICON_RAW_SVG } from "~static/icons/vulti-raw";
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

enum EventMethod {
  ACCOUNTS_CHANGED = "ACCOUNTS_CHANGED",
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  ERROR = "ERROR",
  MESSAGE = "MESSAGE",
}

type RequestArguments = {
  method: string;
  params?: Record<string, any>[];
};

interface EthereumProvider {
  isMetaMask: boolean;
  isVultiConnect: boolean;
  _events: Record<string, Function[]>;
  enable(): Promise<string[]>;
  isConnected(): boolean;
  on(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: Function): void;
  request(args: RequestArguments): Promise<string | string[]>;
  _emit(event: string, data: any): void;
  _connect(): void;
  _disconnect(error?: { code: number; message: string }): void;
}

const ethereumProvider: EthereumProvider = {
  isMetaMask: true,
  isVultiConnect: true,
  _events: {},

  isConnected: () => true,
  request: (body) => {
    return new Promise((resolve, reject) => {
      sendToBackgroundViaRelay<
        Messaging.EthRequest.Request,
        Messaging.EthRequest.Response
      >({
        name: "eth-request",
        body,
      })
        .then(resolve)
        .catch(reject);
    });
  },

  enable: () => {
    return new Promise((resolve, reject) => {
      ethereumProvider
        .request({
          method: RequestMethod.ETH_REQUEST_ACCOUNTS,
          params: [],
        })
        .then((accounts) => {
          Array.isArray(accounts) ? resolve(accounts) : reject();
        })
        .catch(reject);
    });
  },

  on: (event, callback) => {
    if (event === EventMethod.CONNECT && ethereumProvider.isConnected()) {
      ethereumProvider
        .request({
          method: RequestMethod.ETH_CHAIN_ID,
          params: [],
        })
        .then((chainId) => {
          callback({ chainId });
        });
    } else {
      if (!ethereumProvider._events[event])
        ethereumProvider._events[event] = [];

      ethereumProvider._events[event].push(callback);
    }

    return;
  },

  removeListener: (event, callback) => {
    const listeners = ethereumProvider._events[event];

    if (!listeners) return;

    ethereumProvider._events[event] = listeners.filter(
      (listener) => listener !== callback
    );
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
    ethereumProvider
      .request({
        method: RequestMethod.ETH_CHAIN_ID,
        params: [],
      })
      .then((chainId) => {
        ethereumProvider._emit(EventMethod.CONNECT, {
          chainId,
        });
      });
  },

  _disconnect: (error) => {
    ethereumProvider._emit(
      EventMethod.DISCONNECT,
      error || { code: 4900, message: "Provider disconnected" }
    );
  },
};

ethereumProvider._connect();
window.vultisig = ethereumProvider;
if (!window.ethereum) window.ethereum = ethereumProvider;
announceProvider({
  info: {
    icon: VULTI_ICON_RAW_SVG,
    name: "Vultisig",
    rdns: "me.vultisig",
    uuid: uuidv4(),
  },
  provider: ethereumProvider as EthereumProvider as EIP1193Provider,
});

let prioritize: boolean = true;

const intervalRef = setInterval(() => {
  if (
    (window.ethereum && window.ethereum.isVultiConnect) ||
    prioritize == false
  )
    clearInterval(intervalRef);

  sendToBackgroundViaRelay<
    Messaging.SetPriority.Request,
    Messaging.SetPriority.Response
  >({
    name: "set-priority",
  })
    .then((res) => {
      if (res) {
        const providerCopy = Object.create(
          Object.getPrototypeOf(ethereumProvider),
          Object.getOwnPropertyDescriptors(ethereumProvider)
        );
        providerCopy.isMetaMask = false;
        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_SVG,
            name: "Vultisig",
            rdns: "me.vultisig",
            uuid: uuidv4(),
          },
          provider: providerCopy as EthereumProvider as EIP1193Provider,
        });

        Object.defineProperties(window, {
          vultisig: {
            value: ethereumProvider,
            configurable: false,
            writable: false,
          },
          ethereum: {
            get() {
              return window.vultiConnectRouter.currentProvider;
            },
            set(newProvider) {
              window.vultiConnectRouter?.addProvider(newProvider);
            },
            configurable: false,
          },
          vultiConnectRouter: {
            value: {
              ethereumProvider,
              lastInjectedProvider: window.ethereum,
              currentProvider: ethereumProvider,
              providers: [
                ethereumProvider,
                ...(window.ethereum ? [window.ethereum] : []),
              ],
              setDefaultProvider(vultiAsDefault: boolean) {
                if (vultiAsDefault) {
                  window.vultiConnectRouter.currentProvider = window.vultisig;
                } else {
                  const nonDefaultProvider =
                    window.vultiConnectRouter?.lastInjectedProvider ??
                    window.ethereum;
                  window.vultiConnectRouter.currentProvider =
                    nonDefaultProvider;
                }
              },
              addProvider(provider: EthereumProvider) {
                if (!window.vultiConnectRouter?.providers?.includes(provider)) {
                  window.vultiConnectRouter?.providers?.push(provider);
                }
                if (ethereumProvider !== provider) {
                  window.vultiConnectRouter.lastInjectedProvider = provider;
                }
              },
            },
            configurable: false,
            writable: false,
          },
        });
      } else {
        prioritize = false;
      }
    })
    .catch((err) => {});
}, 500);

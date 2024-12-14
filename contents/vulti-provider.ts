import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { type EIP1193Provider, announceProvider } from "mipd";
import { ChainKey, EventMethod, EVMRequestMethod } from "~utils/constants";
import type { Messaging, VaultProps } from "~utils/interfaces";
import { v4 as uuidv4 } from "uuid";
import { VULTI_ICON_RAW_SVG } from "~static/icons/vulti-raw";
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

type RequestArguments = {
  method: string;
  params?: Record<string, any>[];
};

interface BaseProvider {
  isVultiConnect: boolean;
  request(args: RequestArguments): Promise<string | string[]>;
  on(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: Function): void;
  _emit(event: string, data: any): void;
  connect(): void;
  disconnect(error?: { code: number; message: string }): void;
  addListener(event: string, callback: (data: any) => void): void;
}

interface EthereumProvider extends BaseProvider {
  isMetaMask: boolean;
  networkVersion: string;
  enable(): Promise<string[]>;
  isConnected(): boolean;
  _events: Record<string, Function[]>;
}

interface UTXOProvider extends BaseProvider {}

interface ThorchainProvider extends BaseProvider {}

interface CosmosProvider extends BaseProvider {}

interface MayaProvider extends BaseProvider {}

const ethereumProvider: EthereumProvider = {
  isMetaMask: true,
  isVultiConnect: true,
  networkVersion: "1",
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
        .then((result) => {
          const { method, params } = body;
          switch (method) {
            case EVMRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
              ethereumProvider._emit(EventMethod.CHAIN_CHANGED, result);
              break;
            }
            case EVMRequestMethod.WALLET_REVOKE_PERMISSIONS: {
              ethereumProvider._emit(EventMethod.DISCONNECT, result);
              break;
            }
          }
          resolve(result);
        })
        .catch(reject);
    });
  },
  enable: () => {
    return new Promise((resolve, reject) => {
      ethereumProvider
        .request({
          method: EVMRequestMethod.ETH_REQUEST_ACCOUNTS,
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
          method: EVMRequestMethod.ETH_CHAIN_ID,
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

  connect: () => {
    ethereumProvider._emit(EventMethod.CONNECT, "");
  },

  disconnect: (error) => {
    ethereumProvider._emit(
      EventMethod.DISCONNECT,
      error || { code: 4900, message: "Provider disconnected" }
    );
  },
  addListener: function (event: string, callback: (data: any) => void): void {
    throw new Error("Function not implemented.");
  },
};

const thorchainProvider: ThorchainProvider = {
  isVultiConnect: true,
  request: (body) => {
    return new Promise((resolve, reject) => {
      sendToBackgroundViaRelay<
        Messaging.ThorRequest.Request,
        Messaging.ThorRequest.Response
      >({
        name: "thor-request",
        body,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  on: (event, callback) => {
    // TODO
    return;
  },
  addListener: (event: string, callback: (data: any) => void) => {
    // TODO
    return;
  },
  removeListener: (event, callback) => {
    // TODO
    return;
  },

  _emit: (event, data) => {
    // TODO
    return;
  },

  connect: () => {
    // TODO
    return;
  },

  disconnect: (error) => {
    // TODO
    return;
  },
};

const mayaProvider: MayaProvider = {
  isVultiConnect: true,
  request: (body) => {
    return new Promise((resolve, reject) => {
      sendToBackgroundViaRelay<
        Messaging.MayaRequest.Request,
        Messaging.MayaRequest.Response
      >({
        name: "maya-request",
        body,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  on: (event, callback) => {
    // TODO
    return;
  },
  addListener: (event: string, callback: (data: any) => void) => {
    // TODO
    return;
  },
  removeListener: (event, callback) => {
    // TODO
    return;
  },

  _emit: (event, data) => {
    // TODO
    return;
  },

  connect: () => {
    // TODO
    return;
  },

  disconnect: (error) => {
    // TODO
    return;
  },
};

const cosmosProvider: CosmosProvider = {
  isVultiConnect: true,
  request: (body) => {
    return new Promise((resolve, reject) => {
      sendToBackgroundViaRelay<
        Messaging.MayaRequest.Request,
        Messaging.MayaRequest.Response
      >({
        name: "cosmos-request",
        body,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  on: (event, callback) => {
    // TODO
    return;
  },
  addListener: (event: string, callback: (data: any) => void) => {
    // TODO
    return;
  },
  removeListener: (event, callback) => {
    // TODO
    return;
  },

  _emit: (event, data) => {
    // TODO
    return;
  },

  connect: () => {
    // TODO
    return;
  },

  disconnect: (error) => {
    // TODO
    return;
  },
};

const createUTXOProvider = (chainKey: ChainKey): UTXOProvider => ({
  isVultiConnect: true,
  request: (body) =>
    sendToBackgroundViaRelay<
      Messaging.UTXORequest.Request,
      Messaging.UTXORequest.Response
    >({
      name: "utxo-request",
      body: { ...body, chainKey },
    }),
  on: () => {},
  addListener: () => {},
  removeListener: () => {},
  _emit: () => {},
  connect: () => {},
  disconnect: () => {},
});

const bitcoinProvider = createUTXOProvider(ChainKey.BITCOIN);
const litecoinProvider = createUTXOProvider(ChainKey.LITECOIN);
const bitcoincashProvider = createUTXOProvider(ChainKey.BITCOINCASH);
const dashProvider = createUTXOProvider(ChainKey.DASH);
const dogecoinProvider = createUTXOProvider(ChainKey.DOGECOIN);

const providers = {
  ethereum: ethereumProvider,
  thorchain: thorchainProvider,
  maya: mayaProvider,
  cosmos: cosmosProvider,
  bitcoin: bitcoinProvider,
  litecoin: litecoinProvider,
  bitcoincash: bitcoincashProvider,
  dash: dashProvider,
  dogecoin: dogecoinProvider,
  getVaults: (): Promise<VaultProps[]> => {
    return new Promise((resolve) => {
      sendToBackgroundViaRelay<
        Messaging.GetVaults.Request,
        Messaging.GetVaults.Response
      >({ name: "get-vaults" }).then(({ vaults }) => {
        resolve(vaults);
      });
    });
  },
};

window.thorchain = thorchainProvider;
window.maya = mayaProvider;
window.vultisig = providers;
window.cosmos = cosmosProvider;
window.bitcoin = bitcoinProvider;
window.litecoin = litecoinProvider;
window.bitcoincash = bitcoincashProvider;
window.dash = dashProvider;
window.dogecoin = dogecoinProvider;

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
          vultisig: { value: providers, configurable: false, writable: false },
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
                window.vultiConnectRouter.currentProvider = vultiAsDefault
                  ? window.vultisig
                  : window.vultiConnectRouter?.lastInjectedProvider ??
                    window.ethereum;
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
          thorchain: {
            value: { ...thorchainProvider },
            configurable: false,
            writable: false,
          },
          maya: {
            value: { ...mayaProvider },
            configurable: false,
            writable: false,
          },
          cosmos: {
            value: { ...cosmosProvider },
            configurable: false,
            writable: false,
          },
          bitcoin: {
            value: { ...bitcoinProvider },
            configurable: false,
            writable: false,
          },
          litecoin: {
            value: { ...litecoinProvider },
            configurable: false,
            writable: false,
          },
          bitcoincash: {
            value: { ...bitcoincashProvider },
            configurable: false,
            writable: false,
          },
          dash: {
            value: { ...dashProvider },
            configurable: false,
            writable: false,
          },
          dogecoin: {
            value: { ...dogecoinProvider },
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

import type { PlasmoCSConfig } from "plasmo";
import {
  sendToBackgroundViaRelay,
  sendToBackground,
} from "@plasmohq/messaging";
import { type EIP1193Provider, announceProvider, requestProviders } from "mipd";
import { ChainKey, chains, rpcUrl } from "~utils/constants";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import { JsonRpcProvider, NonceManager } from "ethers";
import api from "~utils/api";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { VULTI_ICON_RAW_SVG } from "~static/icons/vulti-raw";
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

enum RequestMethod {
  ETH_ACCOUNTS = "eth_accounts",
  ETH_BLOB_BASE_FEE = "eth_blobBaseFee",
  ETH_BLOCK_NUMBER = "eth_blockNumber",
  ETH_CALL = "eth_call",
  ETH_CHAIN_ID = "eth_chainId",
  ETH_COINBASE = "eth_coinbase",
  ETH_DECRYPT = "eth_decrypt",
  ETH_ESTIMATE_GAS = "eth_estimateGas",
  ETH_FEE_HISTORY = "eth_feeHistory",
  ETH_GAS_PRICE = "eth_gasPrice",
  ETH_GET_BALANCE = "eth_getBalance",
  ETH_GET_BLOCK_BY_HASH = "eth_getBlockByHash",
  ETH_GET_BLOCK_BY_NUMBER = "eth_getBlockByNumber",
  ETH_GET_BLOCK_RECEIPTS = "eth_getBlockReceipts",
  ETH_GET_BLOCK_TRANSACTION_COUNT_BY_HASH = "eth_getBlockTransactionCountByHash",
  ETH_GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = "eth_getBlockTransactionCountByNumber",
  ETH_GET_CODE = "eth_getCode",
  ETH_GET_ENCRYPTION_PUBLIC_KEY = "eth_getEncryptionPublicKey",
  ETH_GET_FILTER_CHANGES = "eth_getFilterChanges",
  ETH_GET_FILTER_LOGS = "eth_getFilterLogs",
  ETH_GET_LOGS = "eth_getLogs",
  ETH_GET_PROOF = "eth_getProof",
  ETH_GET_STORAGEAT = "eth_getStorageAt",
  ETH_GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX = "eth_getTransactionByBlockHashAndIndex",
  ETH_GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = "eth_getTransactionByBlockNumberAndIndex",
  ETH_GET_TRANSACTION_BY_HASH = "eth_getTransactionByHash",
  ETH_GET_TRANSACTION_COUNT = "eth_getTransactionCount",
  ETH_GET_TRANSACTION_RECEIPT = "eth_getTransactionReceipt",
  ETH_GET_UNCLE_COUNT_BY_BLOCK_HASH = "eth_getUncleCountByBlockHash",
  ETH_GET_UNCLE_COUNT_BY_BLOCK_NUMBER = "eth_getUncleCountByBlockNumber",
  ETH_MAX_PRIORITY_FEE_PER_GAS = "eth_maxPriorityFeePerGas",
  ETH_NEW_BLOCK_FILTER = "eth_newBlockFilter",
  ETH_NEW_FILTER = "eth_newFilter",
  ETH_NEW_PENDING_TRANSACTION_FILTER = "eth_newPendingTransactionFilter",
  ETH_REQUEST_ACCOUNTS = "eth_requestAccounts",
  ETH_SEND_RAW_TRANSACTION = "eth_sendRawTransaction",
  ETH_SEND_TRANSACTION = "eth_sendTransaction",
  ETH_SIGN = "eth_sign",
  ETH_SIGN_TYPED_DATA_V4 = "eth_signTypedData_v4",
  ETH_SUBSCRIBE = "eth_subscribe",
  ETH_SYNCING = "eth_syncing",
  ETH_UNINSTALL_FILTER = "eth_uninstallFilter",
  ETH_UNSUBSCRIBE = "eth_unsubscribe",
  PERSONAL_SIGN = "personal_sign",
  WALLET_ADD_ETHEREUM_CHAIN = "wallet_addEthereumChain",
  WALLET_GET_PERMISSIONS = "wallet_getPermissions",
  WALLET_REGISTER_ONBOARDING = "wallet_registerOnboarding",
  WALLET_REQUEST_PERMISSIONS = "wallet_requestPermissions",
  WALLET_REVOKE_PERMISSIONS = "wallet_revokePermissions",
  WALLET_SWITCH_ETHEREUM_CHAIN = "wallet_switchEthereumChain",
  WALLET_SCAN_QR_CODE = "wallet_scanQRCode",
  WALLET_WATCH_ASSET = "wallet_watchAsset",
  WEB3_CLIENT_VERSION = "web3_clientVersion",
}

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

interface BaseProviderState {
  accounts: string[];
  chainId: string;
  chainKey: ChainKey;
  isConnected: boolean;
}

interface EthereumProvider {
  isMetaMask: boolean;
  isVultiConnect: boolean;
  _events: Record<string, Function[]>;
  _state: BaseProviderState;
  enable(): Promise<string[]>;
  isConnected(): boolean;
  on(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: Function): void;
  request(args: RequestArguments): Promise<string | string[]>;
  _emit(event: string, data: any): void;
  _connect(): void;
  _disconnect(error?: { code: number; message: string }): void;
}

const defaultChain = chains.find(({ name }) => name === ChainKey.ETHEREUM);

const ethereumProvider: EthereumProvider = {
  isMetaMask: true,
  isVultiConnect: true,
  _events: {},
  _state: {
    accounts: [],
    chainId: defaultChain.id,
    isConnected: false,
    chainKey: defaultChain.name,
  },

  isConnected: () => ethereumProvider._state.isConnected,

  request: ({ method, params = [] }) => {
    return new Promise((resolve, reject) => {
      switch (method) {
        case RequestMethod.ETH_ACCOUNTS: {
          resolve(ethereumProvider._state.accounts);

          break;
        }
        case RequestMethod.ETH_CHAIN_ID: {
          resolve(ethereumProvider._state.chainId);

          break;
        }
        case RequestMethod.ETH_REQUEST_ACCOUNTS: {
          sendToBackgroundViaRelay<
            Messaging.GetChains.Request,
            Messaging.GetChains.Response
          >({
            name: "get-chains",
          })
            .then(({ chains }) => {
              const chain = chains.find(
                ({ id }) => id === ethereumProvider._state.chainId
              );

              if (chain) {
                sendToBackgroundViaRelay<
                  Messaging.GetAccounts.Request,
                  Messaging.GetAccounts.Response
                >({
                  name: "get-accounts",
                  body: { chain: chain.name },
                })
                  .then(({ accounts }) => {
                    ethereumProvider._state.accounts = accounts;

                    resolve(ethereumProvider._state.accounts);
                  })
                  .catch(reject);
              } else {
                ethereumProvider
                  .request({
                    method: RequestMethod.WALLET_ADD_ETHEREUM_CHAIN,
                    params: [{ chainId: ethereumProvider._state.chainId }],
                  })
                  .then(() => {
                    ethereumProvider
                      .request({
                        method: RequestMethod.ETH_REQUEST_ACCOUNTS,
                        params,
                      })
                      .then(resolve)
                      .catch(reject);
                  })
                  .catch(reject);
              }
            })
            .catch(reject);

          break;
        }
        case RequestMethod.ETH_SEND_TRANSACTION: {
          const [transaction] = params as TransactionProps[];
          if (transaction) {
            sendToBackgroundViaRelay<
              Messaging.SendTransaction.Request,
              Messaging.SendTransaction.Response
            >({
              name: "send-transaction",
              body: { transaction },
            })
              .then(({ transactionHash }) => {
                resolve(transactionHash);
              })
              .catch(reject);
          } else {
            reject();
          }
          break;
        }
        case RequestMethod.ETH_GET_TRANSACTION_BY_HASH: {
          const hash = params[0];
          axios
            .post(rpcUrl[ethereumProvider._state.chainKey], {
              id: 1,
              jsonrpc: "2.0",
              method: "eth_getTransactionByHash",
              params: [hash],
            })
            .then((res) => {
              resolve(res.data.result);
            });
          break;
        }
        case RequestMethod.ETH_BLOCK_NUMBER: {
          const provider = new JsonRpcProvider(
            rpcUrl[ethereumProvider._state.chainKey]
          );
          provider.getBlock("latest").then((block) => {
            resolve(String(block.number));
          });
          break;
        }
        case RequestMethod.WALLET_ADD_ETHEREUM_CHAIN: {
          const [param] = params;

          if (param?.chainId) {
            const supportedChain = chains.find(
              ({ id }) => id === param.chainId
            );

            if (supportedChain) {
              sendToBackgroundViaRelay<
                Messaging.GetChains.Request,
                Messaging.GetChains.Response
              >({
                name: "get-chains",
              })
                .then(({ chains }) => {
                  sendToBackgroundViaRelay<
                    Messaging.SetChains.Request,
                    Messaging.SetChains.Response
                  >({
                    name: "set-chains",
                    body: {
                      chains: [
                        { ...supportedChain, active: true },
                        ...chains
                          .filter(({ name }) => name !== supportedChain.name)
                          .map((chain) => ({
                            ...chain,
                            active: false,
                          })),
                      ],
                    },
                  })
                    .then(() => {
                      ethereumProvider._state.chainId = param.chainId;

                      resolve(null);
                    })
                    .catch(reject);
                })
                .catch(reject);
            } else {
              reject(); // unsuported chain
            }
          } else {
            reject(); // chainId is required
          }

          break;
        }
        case RequestMethod.WALLET_GET_PERMISSIONS: {
          resolve([]);

          break;
        }
        case RequestMethod.WALLET_REQUEST_PERMISSIONS: {
          resolve([]);

          break;
        }
        case RequestMethod.WALLET_REVOKE_PERMISSIONS: {
          resolve(null);

          break;
        }
        case RequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
          const [param] = params;

          if (param?.chainId) {
            sendToBackgroundViaRelay<
              Messaging.GetChains.Request,
              Messaging.GetChains.Response
            >({
              name: "get-chains",
            })
              .then(({ chains }) => {
                const existed =
                  chains.findIndex(({ id }) => id === param.chainId) >= 0;

                if (existed) {
                  sendToBackgroundViaRelay<
                    Messaging.SetChains.Request,
                    Messaging.SetChains.Response
                  >({
                    name: "set-chains",
                    body: {
                      chains: chains.map((chain) => ({
                        ...chain,
                        active: chain.id === param.chainId,
                      })),
                    },
                  })
                    .then(() => {
                      ethereumProvider._state.chainId = param.chainId;
                      ethereumProvider._state.chainKey = chains.find(
                        (chain) => chain.id === param.chainId
                      ).name;
                      resolve(null);
                    })
                    .catch(reject);
                } else {
                  ethereumProvider
                    .request({
                      method: RequestMethod.WALLET_ADD_ETHEREUM_CHAIN,
                      params,
                    })
                    .then(resolve)
                    .catch(reject);
                }
              })
              .catch(reject);
          } else {
            reject(); // chainId is required
          }

          break;
        }
        default: {
          ethereumProvider._emit(
            EventMethod.ERROR,
            new Error(`Unsupported method: ${method}`)
          );
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
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
      callback({ chainId: ethereumProvider._state.chainId });
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
    ethereumProvider._state.isConnected = true;

    console.log("_connect");

    ethereumProvider._emit(EventMethod.CONNECT, {
      chainId: ethereumProvider._state.chainId,
    });
  },

  _disconnect: (error) => {
    ethereumProvider._state.isConnected = false;

    console.log("_disconnect");

    ethereumProvider._emit(
      EventMethod.DISCONNECT,
      error || { code: 4900, message: "Provider disconnected" }
    );
  },
};

ethereumProvider._connect();
window.vultisig = ethereumProvider;

setTimeout(() => {
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
      }
    })
    .catch((err) => {
      console.log(err);
    });
}, 1000);

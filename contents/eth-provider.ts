import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { ChainKey, chains, rpcUrl } from "~utils/constants";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import { JsonRpcProvider, NonceManager } from "ethers";

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
  isConnected: boolean;
}

interface EthereumProvider {
  isMetaMask: boolean;
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

  _events: {},
  _state: {
    accounts: [],
    chainId: defaultChain.id,
    isConnected: false,
  },

  isConnected: () => ethereumProvider._state.isConnected,

  request: ({ method, params = [] }) => {
    console.log(method);
    console.log(params);

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
                  body: {
                    chain: chain.name,
                    screen: {
                      height: window.screen.height,
                      width: window.screen.width,
                    },
                  },
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
              body: {
                screen: {
                  height: window.screen.height,
                  width: window.screen.width,
                },
                transaction,
              },
            })
              .then(({ transactionHash }) => {
                resolve(transactionHash);
              })
              .catch(reject);
          } else {
            reject(); // transaction params is required
          }

          break;
        }
        case RequestMethod.ETH_BLOCK_NUMBER: {
          const provider = new JsonRpcProvider(rpcUrl[ChainKey.ETHEREUM]);

          console.log(provider.getBlock("latest"));
          provider.getBlock("latest").then((block) => {
            resolve(String(block.number));

            // data: "0x095ea7b300000000000000000000000069460570c93f9de5e2edbc3052bf10125f0ca22d00000000000000000000000000000000000000000000000000000000000f4240";
            // from: "0x14f6ed6cbb27b607b0e2a48551a988f1a19c89b6";
            // gas: "0x13153";
            // maxFeePerGas: "0x28db4f454";
            // maxPriorityFeePerGas: "0xf6ba9ae8";
            // to: "0xdac17f958d2ee523a2206206994597c13d831ec7";

            // Arbitrum

            // data: "0xb17d0e6e00000000000000000000000000000000362a0795704d4bec9b0c728bf9ce47380000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000000000000000000000000000000005fd1ec78c57b00000000000000000000000000000000000000000000000000000024d9a423ad000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d8d4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014f6ed6cbb27b607b0e2a48551a988f1a19c89b600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564000000000000000000000000e592427a0aece92de3edee1f18e0157c058615640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005fd1ec78c57b00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001c4ac9650d80000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000124c04b8d59000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000069460570c93f9de5e2edbc3052bf10125f0ca22d000000000000000000000000000000000000000000000000000001925c6b78d900000000000000000000000000000000000000000000000000005fd1ec78c57b000000000000000000000000000000000000000000000000000000000003d8d4000000000000000000000000000000000000000000000000000000000000002b82af49447d8a07e3bd95bd0d56f35241523fbab10001f4fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            // from: "0x14f6ed6cbb27b607b0e2a48551a988f1a19c89b6";
            // gas: "0x14da45";
            // maxFeePerGas: "0xc65d40";
            // maxPriorityFeePerGas: "0x0";
            // to: "0x69460570c93f9de5e2edbc3052bf10125f0ca22d";
            // value: "0x5ff6c61ce928";
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

window.ethereum = ethereumProvider;

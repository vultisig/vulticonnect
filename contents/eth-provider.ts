import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { ChainKey } from "~utils/constants";

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
  removeListener(event: string, callback: Function): void;
  request(args: RequestArguments): Promise<string | string[]>;
  _emit(event: string, data: any): void;
  _connect(): void;
  _disconnect(error?: { code: number; message: string }): void;
}

const ethereumProvider: EthereumProvider = {
  isMetaMask: true,

  _events: {},
  _state: {
    accounts: [],
    chainId: "0x1",
    isConnected: false,
  },

  isConnected: () => ethereumProvider._state.isConnected,

  request: ({ method, params }) => {
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
          sendToBackgroundViaRelay({
            name: "get-accounts",
            body: { chain: ChainKey.ETHEREUM },
          })
            .then((accounts) => {
              ethereumProvider._state.accounts = accounts;

              resolve(ethereumProvider._state.accounts);
            })
            .catch(reject);

          break;
        }
        case RequestMethod.ETH_SEND_TRANSACTION: {
          ethereumProvider._emit(EventMethod.MESSAGE, {
            type: method,
            data: params,
          });

          resolve("0xMockTransactionHash");

          break;
        }
        case RequestMethod.WALLET_ADD_ETHEREUM_CHAIN: {
          const [param] = params;

          if (param?.chainId) ethereumProvider._state.chainId = param.chainId;

          resolve(null);

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

          if (param?.chainId) ethereumProvider._state.chainId = param.chainId;

          resolve(null);

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

import { EIP1193Provider, announceProvider } from "mipd";
import { v4 as uuidv4 } from "uuid";
import {
  PublicKey,
  Transaction,
  SystemInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import EventEmitter from "events";
import base58 from "bs58";
import {
  EventMethod,
  MessageKey,
  RequestMethod,
  SenderKey,
} from "utils/constants";
import { Messaging, VaultProps } from "utils/interfaces";
import VULTI_ICON_RAW_SVG from "content/icon";

enum NetworkType {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

type CallbackRequest = (
  body: Messaging.Chain.Request,
  callback: (error: Error | null, result?: string | string[]) => void
) => void;

type CustomPromiseRequest = (
  method: string,
  params: Record<string, any>[]
) => Promise<string | string[]>;

type PromiseRequest = (
  body: Messaging.Chain.Request
) => Promise<string | string[]>;

const sendToBackgroundViaRelay = <Request, Response>(
  type: MessageKey,
  message: Request
): Promise<Response> => {
  return new Promise((resolve) => {
    const identifier = uuidv4();

    const callback = ({
      data,
      source,
    }: MessageEvent<{
      message: Response;
      identifier: string;
      sender: SenderKey;
      type: MessageKey;
    }>) => {
      if (
        source !== window ||
        data.identifier !== identifier ||
        data.sender !== SenderKey.RELAY ||
        data.type !== type
      )
        return;

      window.removeEventListener("message", callback);

      resolve(data.message);
    };

    window.postMessage(
      { identifier, message, sender: SenderKey.PAGE, type },
      "*"
    );

    window.addEventListener("message", callback);
  });
};

namespace Provider {
  export class Bitcoin extends EventEmitter {
    public chainId: string;
    public network: string;
    public requestAccounts;

    constructor() {
      super();
      this.requestAccounts = this.getAccounts;
      this.chainId = "Bitcoin_bitcoin-mainnet";
      this.network = NetworkType.MAINNET;
    }

    // TO DO
    signPsbt = () => {
      return new Promise((resolve, reject) => {
        this.request(
          {
            method: RequestMethod.CTRL.SIGN_PSBT,
            params: [],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    };

    getAccounts = (): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        this.request(
          {
            method: RequestMethod.VULTISIG.GET_ACCOUNTS,
            params: [],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result && Array.isArray(result)) {
              resolve(result);
            } else {
              reject("Invalid result");
            }
          }
        );
      });
    };

    changeNetwork = (network: string): void => {
      if (network !== NetworkType.MAINNET && network !== NetworkType.TESTNET)
        throw Error(`Invalid network ${network}`);

      this.chainId = `Bitcoin_bitcoin-${network}`;
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.BITCOIN_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class BitcoinCash extends EventEmitter {
    public chainId: string;
    public network: string;
    public providerType: string;

    constructor(providerType: string) {
      super();
      this.chainId = "Bitcoincash_bitcoincash";
      this.network = NetworkType.MAINNET;
      this.providerType = providerType;
    }

    changeNetwork = (network: string): void => {
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.BITCOIN_CASH_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class Cosmos extends EventEmitter {
    public isVultiConnect: boolean;

    constructor() {
      super();
      this.isVultiConnect = true;
    }

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.COSMOS_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class Dash extends EventEmitter {
    public chainId: string;
    public network: string;
    public providerType: string;

    constructor(providerType: string) {
      super();
      this.chainId = "Dash_dash";
      this.network = NetworkType.MAINNET;
      this.providerType = providerType;
    }

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback): void => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.DASH_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class Dogecoin extends EventEmitter {
    public chainId: string;
    public network: string;
    public providerType: string;

    constructor(providerType: string) {
      super();
      this.chainId = "Dogecoin_dogecoin";
      this.network = NetworkType.MAINNET;
      this.providerType = providerType;
    }

    changeNetwork = (network: string): void => {
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.DOGECOIN_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class Ethereum extends EventEmitter {
    public chainId: string;
    public connected: boolean;
    public isCtrl: boolean;
    public isMetaMask: boolean;
    public isVultiConnect: boolean;
    public isXDEFI: boolean;
    public networkVersion: string;
    public selectedAddress: string;

    constructor() {
      super();
      this.chainId = "0x1";
      this.connected = false;
      this.isCtrl = true;
      this.isMetaMask = true;
      this.isVultiConnect = true;
      this.isXDEFI = true;
      this.networkVersion = "1";
      this.selectedAddress = "";
    }

    enable = (): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        this.request({
          method: RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS,
          params: [],
        })
          .then((accounts: any) =>
            Array.isArray(accounts) ? resolve(accounts) : reject()
          )
          .catch(reject);
      });
    };

    isConnected = (): boolean => {
      return this.connected;
    };

    emitAccountsChanged = (addresses: string[]): void => {
      if (addresses.length) {
        const [address] = addresses;

        this.selectedAddress = address ?? "";
        this.emit(EventMethod.ACCOUNTS_CHANGED, address ? [address] : []);
      } else {
        this.selectedAddress = "";
        this.emit(EventMethod.ACCOUNTS_CHANGED, []);
      }
    };

    emitUpdateNetwork = ({ chainId }: { chainId: string }): void => {
      if (Number(chainId) && this.chainId !== chainId) this.chainId = chainId;

      this.emit(EventMethod.NETWORK_CHANGED, Number(this.chainId));
      this.emit(EventMethod.CHAIN_CHANGED, this.chainId);
    };

    on = (event: string, callback: (data: any) => void): this => {
      if (event === EventMethod.CONNECT && this.isConnected()) {
        this.request({
          method: RequestMethod.METAMASK.ETH_CHAIN_ID,
          params: [],
        }).then((chainId) => {
          callback({ chainId });
        });
      } else {
        super.on(event, callback);
      }

      return this;
    };

    request: PromiseRequest = (body) => {
      return new Promise((resolve, reject) => {
        sendToBackgroundViaRelay<
          Messaging.Chain.Request,
          Messaging.Chain.Response
        >(MessageKey.ETHEREUM_REQUEST, body)
          .then((result) => {
            const { method } = body;

            switch (method) {
              case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN:
              case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
                this.emitUpdateNetwork({ chainId: result as string });

                break;
              }
              case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
                this.emit(EventMethod.DISCONNECT, result);

                break;
              }
            }

            resolve(result);
          })
          .catch(reject);
      });
    };

    sendAsync: CallbackRequest = (body, callback) => {
      this.request(body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };

    send = (e: any, t: any): Promise<string | string[]> | void => {
      if (typeof e === "string") {
        return this.request({
          method: e,
          params: t ?? [],
        });
      }

      if (typeof t === "function") {
        this.sendAsync(e, t);

        return;
      }

      return this.request(e);
    };

    _connect = (): void => {
      this.emit(EventMethod.CONNECT, "");
    };

    _disconnect = (error?: { code: number; message: string }): void => {
      this.emit(
        EventMethod.DISCONNECT,
        error || { code: 4900, message: "Provider disconnected" }
      );
    };
  }

  export class Litecoin extends EventEmitter {
    public chainId: string;
    public network: string;
    public providerType: string;

    constructor(providerType: string) {
      super();
      this.chainId = "Litecoin_litecoin";
      this.network = NetworkType.MAINNET;
      this.providerType = providerType;
    }

    changeNetwork = (network: string): void => {
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.LITECOIN_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class Solana extends EventEmitter {
    public chainId: string;
    public isConnected: boolean;
    public isPhantom: boolean;
    public isXDEFI: boolean;
    public network: string;
    public publicKey?: PublicKey;

    constructor() {
      super();
      this.chainId = "Solana_mainnet-beta";
      this.isConnected = false;
      this.isPhantom = false;
      this.isXDEFI = false;
      this.network = NetworkType.MAINNET;
    }

    request: CustomPromiseRequest = (method, params) => {
      return new Promise((resolve, reject) => {
        sendToBackgroundViaRelay<
          Messaging.Chain.Request,
          Messaging.Chain.Response
        >(MessageKey.SOLANA_REQUEST, { method, params })
          .then(resolve)
          .catch(reject);
      });
    };
    async signTransaction(transaction: Transaction) {
      const decodedTransfer = SystemInstruction.decodeTransfer(
        transaction.instructions[0]
      );

      const modifiedTransfer = {
        lamports: decodedTransfer.lamports.toString(),
        fromPubkey: decodedTransfer.fromPubkey.toString(),
        toPubkey: decodedTransfer.toPubkey.toString(),
      };
      return await this.request(RequestMethod.VULTISIG.SEND_TRANSACTION, [
        modifiedTransfer,
      ]).then((result) => {
        const rawData = base58.decode(result[1]);
        return VersionedTransaction.deserialize(rawData);
      });
    }

    async connect() {
      return await this.request(
        RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        []
      ).then(([account]) => {
        this.isConnected = true;
        this.publicKey = new PublicKey(account);
        this.emit(EventMethod.CONNECT, this.publicKey);

        return { publicKey: this.publicKey };
      });
    }

    async disconnect() {
      this.isConnected = false;
      this.publicKey = undefined;
      this.emit(EventMethod.DISCONNECT);

      await Promise.resolve();
    }
  }

  export class MAYAChain extends EventEmitter {
    public chainId: string;
    public network: string;

    constructor() {
      super();
      this.chainId = "Thorchain_mayachain";
      this.network = NetworkType.MAINNET;
    }

    changeNetwork = (network: string): void => {
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.MAYA_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }

  export class THORChain extends EventEmitter {
    public chainId: string;
    public network: NetworkType;

    constructor() {
      super();
      this.chainId = "Thorchain_thorchain";
      this.network = NetworkType.MAINNET;
    }

    changeNetwork = (network: NetworkType): void => {
      if (network !== NetworkType.MAINNET && network !== NetworkType.TESTNET)
        throw Error(`Invalid network ${network}`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    };

    emitAccountsChanged = (): void => {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    };

    request: CallbackRequest = (body, callback) => {
      sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.THOR_REQUEST, body)
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }
}

const bitcoinProvider = new Provider.Bitcoin();
const bitcoinCashProvider = new Provider.BitcoinCash("bitcoincash");
const cosmosProvider = new Provider.Cosmos();
const dashProvider = new Provider.Dash("dash");
const dogecoinProvider = new Provider.Dogecoin("dogecoin");
const ethereumProvider = new Provider.Ethereum();
const litecoinProvider = new Provider.Litecoin("litecoin");
const mayachainProvider = new Provider.MAYAChain();
const solanaProvider = new Provider.Solana();
const thorchainProvider = new Provider.THORChain();

const xfiProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  mayachain: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  info: {
    installed: true,
    isCtrl: false,
    isVultiConnect: true,
    network: NetworkType.MAINNET,
    version: "0.0.1",
  },
  installed: true,
};

const vultisigProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dash: dashProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  mayachain: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  getVaults: (): Promise<VaultProps[]> => {
    return new Promise((resolve) => {
      sendToBackgroundViaRelay<
        Messaging.GetVaults.Request,
        Messaging.GetVaults.Response
      >(MessageKey.VAULTS, {}).then((vaults) => resolve(vaults));
    });
  },
};

window.bitcoin = bitcoinProvider;
window.bitcoincash = litecoinProvider;
window.cosmos = cosmosProvider;
window.dash = dashProvider;
window.dogecoin = dogecoinProvider;
window.litecoin = litecoinProvider;
window.maya = mayachainProvider;
window.thorchain = thorchainProvider;
window.vultisig = vultisigProvider;
window.xfi = xfiProvider;

if (!window.ethereum) window.ethereum = ethereumProvider;

announceProvider({
  info: {
    icon: VULTI_ICON_RAW_SVG,
    name: "Vultisig",
    rdns: "me.vultisig",
    uuid: uuidv4(),
  },
  provider: ethereumProvider as Provider.Ethereum as EIP1193Provider,
});

let prioritize: boolean = true;

const intervalRef = setInterval(() => {
  if ((window.ethereum && window.vultisig) || prioritize == false)
    clearInterval(intervalRef);

  sendToBackgroundViaRelay<
    Messaging.SetPriority.Request,
    Messaging.SetPriority.Response
  >(MessageKey.SET_PRIORITY, {})
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
          provider: providerCopy as Provider.Ethereum as EIP1193Provider,
        });

        Object.defineProperties(window, {
          vultisig: {
            value: vultisigProvider,
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
              addProvider(provider: Provider.Ethereum) {
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
          bitcoin: {
            value: { ...bitcoinProvider },
            configurable: false,
            writable: false,
          },
          bitcoincash: {
            value: { ...bitcoinCashProvider },
            configurable: false,
            writable: false,
          },
          cosmos: {
            value: { ...cosmosProvider },
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
          litecoin: {
            value: { ...litecoinProvider },
            configurable: false,
            writable: false,
          },
          maya: {
            value: { ...mayachainProvider },
            configurable: false,
            writable: false,
          },
          thorchain: {
            value: { ...thorchainProvider },
            configurable: false,
            writable: false,
          },
        });
      } else {
        prioritize = false;
      }
    })
    .catch(() => {});
}, 500);

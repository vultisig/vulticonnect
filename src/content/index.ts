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
import { CosmJSOfflineSigner, Keplr } from "@keplr-wallet/provider";
import {
  KeplrMode,
  KeplrSignOptions,
  OfflineAminoSigner,
  OfflineDirectSigner,
} from "@keplr-wallet/types";
enum NetworkKey {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}
window.ctrlKeplrProviders = {};
type Callback = (error: Error | null, result?: string | string[]) => void;

const sendToBackgroundViaRelay = <Request, Response>(
  type: MessageKey,
  message: Request
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();

    const callback = ({
      data,
      source,
    }: MessageEvent<{
      error: string;
      id: string;
      message: Response;
      sender: SenderKey;
      type: MessageKey;
    }>) => {
      if (
        source !== window ||
        data.id !== id ||
        data.sender !== SenderKey.RELAY ||
        data.type !== type
      )
        return;

      window.removeEventListener("message", callback);

      data.error ? reject(data.error) : resolve(data.message);
    };

    window.postMessage({ id, message, sender: SenderKey.PAGE, type }, "*");

    window.addEventListener("message", callback);
  });
};

class XDEFIKeplrProvider extends Keplr {
  static instance: XDEFIKeplrProvider | null = null;
  isXDEFI: boolean;
  isVulticonnect: boolean;
  static getInstance(): XDEFIKeplrProvider {
    if (!this.instance) {
      this.instance = new XDEFIKeplrProvider(
        "0.0.1",
        "extension",
        {}
      );
    }

    window.ctrlKeplrProviders["Ctrl Wallet"] = this.instance;
    return this.instance;
  }

  emitAccountsChanged(): void {
    window.dispatchEvent(new Event("keplr_keystorechange"));
  }

  constructor(version: string, mode: KeplrMode, requester: any) {
    super(version, mode, requester);
    this.isXDEFI = true;
    this.isVulticonnect = true;
    window.ctrlKeplrProviders["Ctrl Wallet"] = this;
  }
  
  enable(_chainIds: string | string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
          params: [],
        })
        .then(resolve)
        .catch(reject);
    });
  }
  getOfflineSigner(
    chainId: string,
    _signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    const cosmSigner = new CosmJSOfflineSigner(
      chainId,
      window.keplr,
      _signOptions
    );
    cosmSigner.getAccounts = async () => {
      return cosmosProvider
        .request({ method: RequestMethod.VULTISIG.CHAIN_ID, params: [] })
        .then(async (currentChainID) => {
          if (currentChainID !== chainId) {
            return await cosmosProvider
              .request({
                method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
                params: [{ chainId }],
              })
              .then(async () => {
                return await cosmosProvider.request({
                  method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
                  params: [],
                });
              });
          } else {
            return await cosmosProvider.request({
              method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
              params: [],
            });
          }
        });
    };

    return cosmSigner as OfflineAminoSigner & OfflineDirectSigner;
  }
}

namespace Provider {
  export class Bitcoin extends EventEmitter {
    public chainId: string;
    public network: string;
    public requestAccounts;

    constructor() {
      super();
      this.chainId = "Bitcoin_bitcoin-mainnet";
      this.network = NetworkKey.MAINNET;

      this.requestAccounts = this.getAccounts;
      this.request = this.request;
    }

    async getAccounts() {
      return await this.request({
        method: RequestMethod.VULTISIG.ACCOUNTS,
        params: [],
      });
    }
    async signPsbt() {
      return await this.request({
        method: RequestMethod.CTRL.SIGN_PSBT,
        params: [],
      });
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.chainId = `Bitcoin_bitcoin-${network}`;
      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.BITCOIN_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class BitcoinCash extends EventEmitter {
    public chainId: string;
    public network: string;

    constructor() {
      super();
      this.chainId = "Bitcoincash_bitcoincash";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.BITCOIN_CASH_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class Cosmos extends EventEmitter {
    public isVultiConnect: boolean;

    constructor() {
      super();
      this.isVultiConnect = true;
      this.request = this.request;
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.COSMOS_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class Dash extends EventEmitter {
    public chainId: string;
    public network: string;

    constructor() {
      super();
      this.chainId = "Dash_dash";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.DASH_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class Dogecoin extends EventEmitter {
    public chainId: string;
    public network: string;

    constructor() {
      super();
      this.chainId = "Dogecoin_dogecoin";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.DOGECOIN_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
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
    public sendAsync;

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

      this.sendAsync = this.request;
      this.request = this.request;
    }

    async enable() {
      return await this.request({
        method: RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS,
        params: [],
      });
    }

    emitAccountsChanged(addresses: string[]) {
      if (addresses.length) {
        const [address] = addresses;

        this.selectedAddress = address ?? "";
        this.emit(EventMethod.ACCOUNTS_CHANGED, address ? [address] : []);
      } else {
        this.selectedAddress = "";
        this.emit(EventMethod.ACCOUNTS_CHANGED, []);
      }
    }

    emitUpdateNetwork({ chainId }: { chainId: string }) {
      if (Number(chainId) && this.chainId !== chainId) this.chainId = chainId;

      this.emit(EventMethod.NETWORK_CHANGED, Number(this.chainId));
      this.emit(EventMethod.CHAIN_CHANGED, this.chainId);
    }

    isConnected() {
      return this.connected;
    }

    on = (event: string, callback: (data: any) => void): this => {
      if (event === EventMethod.CONNECT && this.isConnected()) {
        this.request({
          method: RequestMethod.METAMASK.ETH_CHAIN_ID,
          params: [],
        }).then((chainId) => callback({ chainId }));
      } else {
        super.on(event, callback);
      }

      return this;
    };

    async send(x: any, y: any) {
      if (typeof x === "string") {
        return await this.request({
          method: x,
          params: y ?? [],
        });
      } else if (typeof y === "function") {
        this.request(x, y);
      } else {
        return await this.request(x);
      }
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.ETHEREUM_REQUEST, data)
        .then((result) => {
          switch (data.method) {
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

          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }

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

    constructor() {
      super();
      this.chainId = "Litecoin_litecoin";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.LITECOIN_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
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
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    async signTransaction(transaction: Transaction) {
      const decodedTransfer = SystemInstruction.decodeTransfer(
        transaction.instructions[0]
      );

      const modifiedTransfer = {
        lamports: decodedTransfer.lamports.toString(),
        fromPubkey: decodedTransfer.fromPubkey.toString(),
        toPubkey: decodedTransfer.toPubkey.toString(),
      };
      return await this.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [modifiedTransfer],
      }).then((result) => {
        const rawData = base58.decode(result[1]);
        return VersionedTransaction.deserialize(rawData);
      });
    }

    async connect() {
      return await this.request({
        method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        params: [],
      }).then((account) => {
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

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.SOLANA_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class MAYAChain extends EventEmitter {
    public chainId: string;
    public network: string;

    constructor() {
      super();
      this.chainId = "Thorchain_mayachain";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.MAYA_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }

  export class THORChain extends EventEmitter {
    public chainId: string;
    public network: NetworkKey;

    constructor() {
      super();
      this.chainId = "Thorchain_thorchain";
      this.network = NetworkKey.MAINNET;
      this.request = this.request;
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`);
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`);

      this.network = network;
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network });
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {});
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.THOR_REQUEST, data)
        .then((result) => {
          if (callback) callback(null, result);

          return result;
        })
        .catch((error) => {
          if (callback) callback(error);

          return error;
        });
    }
  }
}

const bitcoinProvider = new Provider.Bitcoin();
const bitcoinCashProvider = new Provider.BitcoinCash();
const cosmosProvider = new Provider.Cosmos();
const dashProvider = new Provider.Dash();
const dogecoinProvider = new Provider.Dogecoin();
const ethereumProvider = new Provider.Ethereum();
const litecoinProvider = new Provider.Litecoin();
const mayachainProvider = new Provider.MAYAChain();
const solanaProvider = new Provider.Solana();
const thorchainProvider = new Provider.THORChain();
const keplrProvider = XDEFIKeplrProvider.getInstance();

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
  keplr: keplrProvider,
  info: {
    installed: true,
    isCtrl: false,
    isVultiConnect: true,
    network: NetworkKey.MAINNET,
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
window.keplr = keplrProvider;
window.xfi.kepler = keplrProvider;

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
  >(MessageKey.PRIORITY, {})
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

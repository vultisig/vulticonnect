import { ChainKey, Currency, Language } from "utils/constants";

export namespace Messaging {
  export namespace GetVaults {
    export type Request = any;
    export type Response = { vaults: VaultProps[] };
  }

  export namespace SetPriority {
    export type Request = { priority?: boolean };
    export type Response = any;
  }

  export namespace EthRequest {
    export type Request = { method: string; params?: Record<string, any>[] };
    export type Response = string | string[];
  }

  export namespace ThorRequest {
    export type Request = any;
    export type Response = string | string[];
  }

  export namespace MayaRequest {
    export type Request = any;
    export type Response = string | string[];
  }

  export namespace CosmosRequest {
    export type Request = any;
    export type Response = string | string[];
  }

  export namespace UTXORequest {
    export type Request = any;
    export type Response = string | string[];
  }
}

export interface AccountsProps {
  chain: ChainKey;
  sender: string;
}

export interface ChainProps {
  active?: boolean;
  address?: string;
  cmcId: number;
  decimals: number;
  derivationKey?: string;
  id: string;
  name: ChainKey;
  ticker: string;
}

export interface ChainExplorerRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BITCOIN]: string;
  [ChainKey.BITCOINCASH]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.DASH]: string;
  [ChainKey.DOGECOIN]: string;
  [ChainKey.DYDX]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.GAIACHAIN]: string;
  [ChainKey.KUJIRA]: string;
  [ChainKey.LITECOIN]: string;
  [ChainKey.MAYACHAIN]: string;
  [ChainKey.OPTIMISM]: string;
  [ChainKey.POLKADOT]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.SOLANA]: string;
  [ChainKey.THORCHAIN]: string;
  [ChainKey.ZKSYNC]: string;
  [ChainKey.OSMOSIS]: string;
}

export interface ChainRpcRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.OPTIMISM]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.ZKSYNC]: string;
  [ChainKey.THORCHAIN]: string;
  [ChainKey.GAIACHAIN]: string;
  [ChainKey.DYDX]: string;
  [ChainKey.KUJIRA]: string;
  [ChainKey.OSMOSIS]: string;
}

export interface CurrencyRef {
  [Currency.AUD]: string;
  [Currency.CAD]: string;
  [Currency.CNY]: string;
  [Currency.EUR]: string;
  [Currency.GBP]: string;
  [Currency.JPY]: string;
  [Currency.RUB]: string;
  [Currency.SEK]: string;
  [Currency.SGD]: string;
  [Currency.USD]: string;
}

export interface SignatureProps {
  Msg: string;
  R: string;
  S: string;
  DerSignature: string;
  RecoveryID: string;
}

export interface LanguageRef {
  [Language.CROATIA]: string;
  [Language.DUTCH]: string;
  [Language.ENGLISH]: string;
  [Language.GERMAN]: string;
  [Language.ITALIAN]: string;
  [Language.PORTUGUESE]: string;
  [Language.RUSSIAN]: string;
  [Language.SPANISH]: string;
}

export interface ScreenProps {
  height: number;
  width: number;
}

export interface TransactionProps {
  chain: ChainProps;
  contract?: string;
  data: string;
  from: string;
  id: string;
  status: "default" | "error" | "pending" | "success";
  memo?: string;
  to: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  isCustomMessage?: boolean;
  customMessage?: CustomMessage;
  txHash?: string;
  customSignature?: string;
  isDeposit: boolean;
  windowId?: number;
}

export interface CustomMessage {
  address: string;
  message: string;
}

export interface VaultProps {
  active?: boolean;
  apps?: string[];
  chains: ChainProps[];
  hexChainCode: string;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  selected?: boolean;
  transactions: TransactionProps[];
  uid: string;
}

export interface ParsedMemo {
  signature: string;
  inputs: string;
}

export interface ThorchainAccountDataResponse {
  address: string;
  publicKey: {
    type: string;
    value: string;
  };
  accountNumber: string;
  sequence: string;
}

export interface MayaAccountDataResponse {
  address: string;
  publicKey: {
    type: string;
    value: string;
  };
  accountNumber: string;
  sequence: string;
}
export interface BaseSpecificTransactionInfo {
  gasPrice: number;
  fee: number;
}

export interface SpecificThorchain extends BaseSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  isDeposit: boolean;
}

export interface SpecificUtxoInfo {
  hash: string;
  amount: bigint;
  index: number;
}

export interface SpecificUtxo extends BaseSpecificTransactionInfo {
  byteFee: number;
  sendMaxAmount: boolean;
  utxos: SpecificUtxoInfo[];
}

export interface SpecificCosmos extends BaseSpecificTransactionInfo {
  accountNumber: number;
  sequence: number;
  gas: number;
  transactionType: number;
}

export interface CosmosAccountData {
  accountNumber: string;
  sequence: string;
}

export interface CosmosAccountDataResponse {
  account: CosmosAccountData;
}

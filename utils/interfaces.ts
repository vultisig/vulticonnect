import { ChainKey, Currency, Language } from "utils/constants";

export namespace Messaging {
  export namespace GetAccounts {
    export type Request = { chain: ChainKey; screen: ScreenProps };
    export type Response = { accounts: string[] };
  }

  export namespace GetChains {
    export type Request = any;
    export type Response = { chains: ChainProps[] };
  }

  export namespace SendTransaction {
    export type Request = {
      screen: ScreenProps;
      transaction: TransactionProps;
    };
    export type Response = { transactionHash: string };
  }

  export namespace SetChains {
    export type Request = { chains: ChainProps[] };
    export type Response = any;
  }
}

export interface AccountsProps {
  addresses: string[];
  chain: ChainKey;
  sender: string;
}

export interface ChainProps {
  active?: boolean;
  address?: string;
  decimals: number;
  id: string;
  name: ChainKey;
  ticker: string;
}

export interface ChainRpcRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.ZKSYNC]: string;
}

export interface CurrencyRef {
  [Currency.AUD]: string;
  [Currency.CAD]: string;
  [Currency.CNY]: string;
  [Currency.EUR]: string;
  [Currency.GPB]: string;
  [Currency.JPY]: string;
  [Currency.RUB]: string;
  [Currency.SEK]: string;
  [Currency.SGD]: string;
  [Currency.USD]: string;
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
  data: string;
  from: string;
  id: string;
  status: "default" | "error" | "pending" | "success";
  to: string;
  value: string;
  chain?: ChainKey;
  decimals?: number;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  ticker?: string;
}

export interface VaultProps {
  active: boolean;
  chains: ChainProps[];
  hexChainCode: string;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  transactions: TransactionProps[];
  uid: string;
}

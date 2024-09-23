import { ChainKey, Currency, Language } from "utils/constants";

export interface ChainProps {
  address: string;
  chain: ChainKey;
  decimals: number;
  id: string;
  ticker: string;
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

export interface VaultProps {
  active: boolean;
  chains: ChainProps[];
  hexChainCode: string;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  uid: string;
}

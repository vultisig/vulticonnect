import keyMirror from "keymirror";

import type { ChainProps, CurrencyRef, LanguageRef } from "~utils/interfaces";

export enum ChainKey {
  ARBITRUM = "Arbitrum",
  AVALANCHE = "Avalanche",
  BASE = "Base",
  BITCOIN = "Bitcoin",
  BITCOINCASH = "BitcoinCash",
  BLAST = "Blast",
  BSCCHAIN = "BSC",
  CRONOSCHAIN = "CronosChain",
  DASH = "Dash",
  DOGECOIN = "Dogecoin",
  DYDX = "Dydx",
  ETHEREUM = "Ethereum",
  GAIACHAIN = "Cosmos",
  KUJIRA = "Kujira",
  LITECOIN = "Litecoin",
  MAYACHAIN = "MayaChain",
  OPTIMISM = "Optimism",
  POLKADOT = "Polkadot",
  POLYGON = "Polygon",
  SOLANA = "Solana",
  SUI = "Sui",
  THORCHAIN = "THORChain",
  ZKSYNC = "Zksync",
}

export enum Currency {
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
  EUR = "EUR",
  GPB = "GPB",
  JPY = "JPY",
  RUB = "RUB",
  SEK = "SEK",
  SGD = "SGD",
  USD = "USD",
}

export enum Language {
  CROATIA = "hr",
  DUTCH = "nl",
  ENGLISH = "en",
  GERMAN = "de",
  ITALIAN = "it",
  RUSSIAN = "ru",
  PORTUGUESE = "pt",
  SPANISH = "es",
}

export const storageKey = keyMirror({
  CURRENCY: true,
  LANGUAGE: true,
  VAULTS: true,
});

export const errorKey = keyMirror({
  FAIL_TO_GET_ADDRESS: true,
  FAIL_TO_GET_VAULT: true,
  FAIL_TO_INIT_WASM: true,
  INVALID_CHAIN: true,
  INVALID_EXTENSION: true,
  INVALID_FILE: true,
  INVALID_QRCODE: true,
  INVALID_VAULT: true,
});

export const currencyName: CurrencyRef = {
  [Currency.AUD]: "Australian Dollar",
  [Currency.CAD]: "Canadian Dollar",
  [Currency.CNY]: "Chinese Yuan",
  [Currency.EUR]: "European Euro",
  [Currency.GPB]: "British Pound",
  [Currency.JPY]: "Japanese Yen",
  [Currency.RUB]: "Russian Ruble",
  [Currency.SEK]: "Swedish Krona",
  [Currency.SGD]: "Singapore Dollar",
  [Currency.USD]: "United States Dollar",
};

export const currencySymbol: CurrencyRef = {
  [Currency.AUD]: "A$",
  [Currency.CAD]: "C$",
  [Currency.CNY]: "¥",
  [Currency.EUR]: "€",
  [Currency.GPB]: "£",
  [Currency.JPY]: "¥",
  [Currency.RUB]: "₽",
  [Currency.SEK]: "kr",
  [Currency.SGD]: "S$",
  [Currency.USD]: "$",
};

export const languageName: LanguageRef = {
  [Language.CROATIA]: "Hrvatski",
  [Language.DUTCH]: "Dutch",
  [Language.ENGLISH]: "English",
  [Language.GERMAN]: "Deutsch",
  [Language.ITALIAN]: "Italiano",
  [Language.PORTUGUESE]: "Português",
  [Language.RUSSIAN]: "Русский",
  [Language.SPANISH]: "Espanol",
};

export const chains: ChainProps[] = [
  {
    address: "",
    chain: ChainKey.ARBITRUM,
    decimals: 18,
    isDefault: true,
    ticker: "ETH",
  },
  {
    address: "",
    chain: ChainKey.AVALANCHE,
    decimals: 18,
    isDefault: true,
    ticker: "AVAX",
  },
  {
    address: "",
    chain: ChainKey.BASE,
    decimals: 18,
    isDefault: true,
    ticker: "ETH",
  },
  {
    address: "",
    chain: ChainKey.BITCOIN,
    decimals: 8,
    isDefault: true,
    ticker: "BTC",
  },
  {
    address: "",
    chain: ChainKey.BITCOINCASH,
    decimals: 8,
    isDefault: true,
    ticker: "BCH",
  },
  {
    address: "",
    chain: ChainKey.BLAST,
    decimals: 18,
    isDefault: true,
    ticker: "ETH",
  },
  {
    address: "",
    chain: ChainKey.BSCCHAIN,
    decimals: 18,
    isDefault: true,
    ticker: "BNB",
  },
  {
    address: "",
    chain: ChainKey.CRONOSCHAIN,
    decimals: 18,
    isDefault: true,
    ticker: "CRO",
  },
  {
    address: "",
    chain: ChainKey.DOGECOIN,
    decimals: 8,
    isDefault: true,
    ticker: "DOGE",
  },
  {
    address: "",
    chain: ChainKey.DYDX,
    decimals: 18,
    isDefault: true,
    ticker: "DYDX",
  },
  {
    address: "",
    chain: ChainKey.DASH,
    decimals: 8,
    isDefault: true,
    ticker: "DASH",
  },
  {
    address: "",
    chain: ChainKey.ETHEREUM,
    decimals: 18,
    isDefault: true,
    ticker: "ETH",
  },
  {
    address: "",
    chain: ChainKey.GAIACHAIN,
    decimals: 6,
    isDefault: true,
    ticker: "ATOM",
  },
  {
    address: "",
    chain: ChainKey.KUJIRA,
    decimals: 6,
    isDefault: true,
    ticker: "KUJI",
  },
  {
    address: "",
    chain: ChainKey.LITECOIN,
    decimals: 8,
    isDefault: true,
    ticker: "LTC",
  },
  {
    address: "",
    chain: ChainKey.MAYACHAIN,
    decimals: 10,
    isDefault: true,
    ticker: "CACAO",
  },
  {
    address: "",
    chain: ChainKey.OPTIMISM,
    decimals: 18,
    isDefault: true,
    ticker: "ETH",
  },
  {
    address: "",
    chain: ChainKey.POLKADOT,
    decimals: 10,
    isDefault: true,
    ticker: "DOT",
  },
  {
    address: "",
    chain: ChainKey.POLYGON,
    decimals: 18,
    isDefault: true,
    ticker: "MATIC",
  },
  {
    address: "",
    chain: ChainKey.SOLANA,
    decimals: 9,
    isDefault: true,
    ticker: "SOL",
  },
  {
    address: "",
    chain: ChainKey.THORCHAIN,
    decimals: 8,
    isDefault: true,
    ticker: "RUNE",
  },
];

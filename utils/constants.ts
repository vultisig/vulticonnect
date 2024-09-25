import { theme } from "antd";
import keyMirror from "keymirror";

import type {
  ChainProps,
  ChainRpcRef,
  CurrencyRef,
  LanguageRef,
} from "~utils/interfaces";

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

export const rpcUrl: ChainRpcRef = {
  [ChainKey.ARBITRUM]: "https://arbitrum-one-rpc.publicnode.com",
  [ChainKey.AVALANCHE]: "https://avalanche-c-chain-rpc.publicnode.com",
  [ChainKey.BASE]: "https://base-rpc.publicnode.com",
  [ChainKey.BLAST]: "https://rpc.ankr.com/blast",
  [ChainKey.BSCCHAIN]: "https://bsc-rpc.publicnode.com",
  [ChainKey.CRONOSCHAIN]: "https://cronos-evm-rpc.publicnode.com",
  [ChainKey.ETHEREUM]: "https://ethereum-rpc.publicnode.com",
  [ChainKey.POLYGON]: "https://polygon-bor-rpc.publicnode.com",
  [ChainKey.ZKSYNC]: "https://mainnet.era.zksync.io",
};

export const chains: ChainProps[] = [
  {
    decimals: 18,
    id: "0xa4b1",
    name: ChainKey.ARBITRUM,
    ticker: "ETH",
  },
  {
    decimals: 18,
    id: "0xa86a",
    name: ChainKey.AVALANCHE,
    ticker: "AVAX",
  },
  {
    decimals: 18,
    id: "0x2105",
    name: ChainKey.BASE,
    ticker: "ETH",
  },
  {
    decimals: 8,
    id: "0x1f96",
    name: ChainKey.BITCOIN,
    ticker: "BTC",
  },
  {
    decimals: 8,
    id: "0x2710",
    name: ChainKey.BITCOINCASH,
    ticker: "BCH",
  },
  {
    decimals: 18,
    id: "0x13e31",
    name: ChainKey.BLAST,
    ticker: "ETH",
  },
  {
    decimals: 18,
    id: "0x38",
    name: ChainKey.BSCCHAIN,
    ticker: "BNB",
  },
  {
    decimals: 18,
    id: "0x19",
    name: ChainKey.CRONOSCHAIN,
    ticker: "CRO",
  },
  {
    decimals: 8,
    id: "0x7d0",
    name: ChainKey.DOGECOIN,
    ticker: "DOGE",
  },
  {
    decimals: 18,
    id: "",
    name: ChainKey.DYDX,
    ticker: "DYDX",
  },
  {
    decimals: 8,
    id: "",
    name: ChainKey.DASH,
    ticker: "DASH",
  },
  {
    decimals: 18,
    id: "0x1",
    name: ChainKey.ETHEREUM,
    ticker: "ETH",
  },
  {
    decimals: 6,
    id: "",
    name: ChainKey.GAIACHAIN,
    ticker: "ATOM",
  },
  {
    decimals: 6,
    id: "",
    name: ChainKey.KUJIRA,
    ticker: "KUJI",
  },
  {
    decimals: 8,
    id: "",
    name: ChainKey.LITECOIN,
    ticker: "LTC",
  },
  {
    decimals: 10,
    id: "",
    name: ChainKey.MAYACHAIN,
    ticker: "CACAO",
  },
  {
    decimals: 18,
    id: "",
    name: ChainKey.OPTIMISM,
    ticker: "ETH",
  },
  {
    decimals: 10,
    id: "",
    name: ChainKey.POLKADOT,
    ticker: "DOT",
  },
  {
    decimals: 18,
    id: "",
    name: ChainKey.POLYGON,
    ticker: "MATIC",
  },
  {
    decimals: 9,
    id: "",
    name: ChainKey.SOLANA,
    ticker: "SOL",
  },
  {
    decimals: 8,
    id: "",
    name: ChainKey.THORCHAIN,
    ticker: "RUNE",
  },
];

export const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    borderRadius: 12,
    colorPrimary: "#33e6bf",
    colorTextLightSolid: "#02122b",
    fontFamily: "inherit",
  },
};

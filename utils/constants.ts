import keyMirror from "keymirror";

import type {
  ChainExplorerRef,
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
  OSMOSIS = "Osmosis",
  POLKADOT = "Polkadot",
  POLYGON = "Polygon",
  SOLANA = "Solana",
  SUI = "Sui",
  THORCHAIN = "THORChain",
  ZKSYNC = "Zksync",
}

export enum EVMChain {
  AVALANCHE = ChainKey.AVALANCHE,
  ARBITRUM = ChainKey.ARBITRUM,
  BASE = ChainKey.BASE,
  BSCCHAIN = ChainKey.BSCCHAIN,
  CRONOSCHAIN = ChainKey.CRONOSCHAIN,
  ETHEREUM = ChainKey.ETHEREUM,
  OPTIMISM = ChainKey.OPTIMISM,
  POLYGON = ChainKey.POLYGON,
}

export enum CosmosChain {
  Gaia = ChainKey.GAIACHAIN,
  Dydx = ChainKey.DYDX,
  Kujira = ChainKey.KUJIRA,
  Osmosis = ChainKey.OSMOSIS,
}
export enum Currency {
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
  EUR = "EUR",
  GBP = "GBP",
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
export enum EventMethod {
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
  CONNECT = "connect",
  DISCONNECT = "diconnect",
  ERROR = "ERROR",
  MESSAGE = "MESSAGE",
}

export enum EVMRequestMethod {
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

export enum RequestMethod {
  GET_TRANSACTION_BY_HASH = "get_transaction_by_hash",
  GET_ACCOUNTS = "get_accounts",
  REQUEST_ACCOUNTS = "request_accounts",
  SEND_TRANSACTION = "send_transaction",
  CHAIN_ID = "chain_id",
  WALLET_ADD_CHAIN = "wallet_add_chain",
  WALLET_SWITCH_CHAIN = "wallet_switch_chain",
  DEPOSIT_TRANSACTION = "deposit_transaction",
}

export const storageKey = keyMirror({
  CURRENCY: true,
  LANGUAGE: true,
  VAULTS: true,
});

export const errorKey = keyMirror({
  FAIL_TO_GET_ACCOUNTS: true,
  FAIL_TO_GET_ADDRESS: true,
  FAIL_TO_GET_VAULT: true,
  FAIL_TO_GET_VAULTS: true,
  FAIL_TO_GET_TRANSACTION: true,
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
  [Currency.GBP]: "British Pound",
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
  [Currency.GBP]: "£",
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

export const explorerUrl: ChainExplorerRef = {
  [ChainKey.ARBITRUM]: "https://arbiscan.io",
  [ChainKey.AVALANCHE]: "https://snowtrace.io",
  [ChainKey.BASE]: "https://basescan.org",
  [ChainKey.BITCOIN]: "https://blockchair.com/bitcoin",
  [ChainKey.BITCOINCASH]: "https://blockchair.com/bitcoin-cash",
  [ChainKey.BLAST]: "https://blastscan.io",
  [ChainKey.BSCCHAIN]: "https://bscscan.com",
  [ChainKey.CRONOSCHAIN]: "https://cronoscan.com",
  [ChainKey.DASH]: "https://blockchair.com/dash",
  [ChainKey.DOGECOIN]: "https://blockchair.com/dogecoin",
  [ChainKey.DYDX]: "https://www.mintscan.io/dydx",
  [ChainKey.ETHEREUM]: "https://etherscan.io",
  [ChainKey.GAIACHAIN]: "https://www.mintscan.io/cosmos",
  [ChainKey.OSMOSIS]: "https://www.mintscan.io/osmosis",
  [ChainKey.KUJIRA]: "https://finder.kujira.network",
  [ChainKey.LITECOIN]: "https://blockchair.com/litecoin",
  [ChainKey.MAYACHAIN]: "https://www.mayascan.org",
  [ChainKey.OPTIMISM]: "https://optimistic.etherscan.io",
  [ChainKey.POLKADOT]: "https://polkadot.subscan.io/account",
  [ChainKey.POLYGON]: "https://polygonscan.com",
  [ChainKey.SOLANA]: "https://explorer.solana.com",
  [ChainKey.THORCHAIN]: "https://thorchain.net",
  [ChainKey.ZKSYNC]: "https://explorer.zksync.io",
};

export const rpcUrl: ChainRpcRef = {
  [ChainKey.ARBITRUM]: "https://arbitrum-one-rpc.publicnode.com",
  [ChainKey.AVALANCHE]: "https://avalanche-c-chain-rpc.publicnode.com",
  [ChainKey.BASE]: "https://base-rpc.publicnode.com",
  [ChainKey.BLAST]: "https://rpc.ankr.com/blast",
  [ChainKey.BSCCHAIN]: "https://bsc-rpc.publicnode.com",
  [ChainKey.CRONOSCHAIN]: "https://cronos-evm-rpc.publicnode.com",
  [ChainKey.OPTIMISM]: "https://optimism-rpc.publicnode.com",
  [ChainKey.ETHEREUM]: "https://ethereum-rpc.publicnode.com",
  [ChainKey.POLYGON]: "https://polygon-bor-rpc.publicnode.com",
  [ChainKey.ZKSYNC]: "https://mainnet.era.zksync.io",
  [ChainKey.THORCHAIN]: "https://rpc.ninerealms.com/",
  [ChainKey.GAIACHAIN]: "https://cosmos-rpc.publicnode.com:443",
  [ChainKey.DYDX]: "https://dydx-rpc.publicnode.com:443",
  [ChainKey.KUJIRA]: "https://kujira-rpc.publicnode.com:443",
  [ChainKey.OSMOSIS]: "https://osmosis-rpc.publicnode.com:443",
};

export const chains: ChainProps[] = [
  {
    cmcId: 1027,
    decimals: 18,
    id: "0xa4b1",
    name: ChainKey.ARBITRUM,
    ticker: "ETH",
  },
  {
    cmcId: 5805,
    decimals: 18,
    id: "0xa86a",
    name: ChainKey.AVALANCHE,
    ticker: "AVAX",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "0x2105",
    name: ChainKey.BASE,
    ticker: "ETH",
  },
  {
    cmcId: 1,
    decimals: 8,
    id: "0x1f96",
    name: ChainKey.BITCOIN,
    ticker: "BTC",
  },
  {
    cmcId: 1831,
    decimals: 8,
    id: "0x2710",
    name: ChainKey.BITCOINCASH,
    ticker: "BCH",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "0x13e31",
    name: ChainKey.BLAST,
    ticker: "ETH",
  },
  {
    cmcId: 1839,
    decimals: 18,
    id: "0x38",
    name: ChainKey.BSCCHAIN,
    ticker: "BNB",
  },
  {
    cmcId: 3635,
    decimals: 18,
    id: "0x19",
    name: ChainKey.CRONOSCHAIN,
    ticker: "CRO",
  },
  {
    cmcId: 74,
    decimals: 8,
    id: "0x7d0",
    name: ChainKey.DOGECOIN,
    ticker: "DOGE",
  },
  {
    cmcId: 28324,
    decimals: 18,
    id: "dydx-1",
    name: ChainKey.DYDX,
    ticker: "DYDX",
  },
  {
    cmcId: 131,
    decimals: 8,
    id: "Dash_dash",
    name: ChainKey.DASH,
    ticker: "DASH",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "0x1",
    name: ChainKey.ETHEREUM,
    ticker: "ETH",
  },
  {
    cmcId: 3794,
    decimals: 6,
    id: "cosmoshub-4",
    name: ChainKey.GAIACHAIN,
    ticker: "ATOM",
  },
  {
    cmcId: 15185,
    decimals: 6,
    id: "kaiyo-1",
    name: ChainKey.KUJIRA,
    ticker: "KUJI",
  },
  {
    cmcId: 2,
    decimals: 8,
    id: "Litecoin_litecoin",
    name: ChainKey.LITECOIN,
    ticker: "LTC",
  },
  {
    cmcId: 23534,
    decimals: 10,
    id: "MayaChain-1",
    name: ChainKey.MAYACHAIN,
    ticker: "CACAO",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "",
    name: ChainKey.OPTIMISM,
    ticker: "ETH",
  },
  {
    cmcId: 12220,
    decimals: 6,
    id: "osmosis-1",
    name: ChainKey.OSMOSIS,
    ticker: "OSMO",
  },
  {
    cmcId: 6636,
    decimals: 10,
    id: "",
    name: ChainKey.POLKADOT,
    ticker: "DOT",
  },
  {
    cmcId: 3890,
    decimals: 18,
    id: "0x89",
    name: ChainKey.POLYGON,
    ticker: "MATIC",
  },
  {
    cmcId: 5426,
    decimals: 9,
    id: "",
    name: ChainKey.SOLANA,
    ticker: "SOL",
  },
  {
    cmcId: 4157,
    decimals: 8,
    id: "Thorchain_1",
    name: ChainKey.THORCHAIN,
    ticker: "RUNE",
  },
];

export const allSupportedChains: ChainProps[] = [
  {
    cmcId: 1027,
    decimals: 18,
    id: "0x1",
    name: ChainKey.ETHEREUM,
    ticker: "ETH",
  },
  {
    cmcId: 1,
    decimals: 8,
    id: "0x1f96",
    name: ChainKey.BITCOIN,
    ticker: "BTC",
  },
  {
    cmcId: 2,
    decimals: 8,
    id: "Litecoin_litecoin",
    name: ChainKey.LITECOIN,
    ticker: "LTC",
  },
  {
    cmcId: 131,
    decimals: 8,
    id: "Dash_dash",
    name: ChainKey.DASH,
    ticker: "DASH",
  },
  {
    cmcId: 74,
    decimals: 8,
    id: "0x7d0",
    name: ChainKey.DOGECOIN,
    ticker: "DOGE",
  },
  {
    cmcId: 1831,
    decimals: 8,
    id: "0x2710",
    name: ChainKey.BITCOINCASH,
    ticker: "BCH",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "0xa4b1",
    name: ChainKey.ARBITRUM,
    ticker: "ETH",
  },
  {
    cmcId: 5805,
    decimals: 18,
    id: "0xa86a",
    name: ChainKey.AVALANCHE,
    ticker: "AVAX",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "0x2105",
    name: ChainKey.BASE,
    ticker: "ETH",
  },
  {
    cmcId: 1839,
    decimals: 18,
    id: "0x38",
    name: ChainKey.BSCCHAIN,
    ticker: "BNB",
  },
  {
    cmcId: 3635,
    decimals: 18,
    id: "0x19",
    name: ChainKey.CRONOSCHAIN,
    ticker: "CRO",
  },

  {
    cmcId: 1027,
    decimals: 18,
    id: "0x13e31",
    name: ChainKey.BLAST,
    ticker: "ETH",
  },
  {
    cmcId: 1027,
    decimals: 18,
    id: "",
    name: ChainKey.OPTIMISM,
    ticker: "ETH",
  },
  {
    cmcId: 3890,
    decimals: 18,
    id: "0x89",
    name: ChainKey.POLYGON,
    ticker: "MATIC",
  },
  {
    cmcId: 23534,
    decimals: 10,
    id: "MayaChain-1",
    name: ChainKey.MAYACHAIN,
    ticker: "CACAO",
  },
  {
    cmcId: 4157,
    decimals: 8,
    id: "Thorchain_1",
    name: ChainKey.THORCHAIN,
    ticker: "RUNE",
  },
  {
    cmcId: 12220,
    decimals: 6,
    id: "osmosis-1",
    name: ChainKey.OSMOSIS,
    ticker: "OSMO",
  },
  {
    cmcId: 3794,
    decimals: 6,
    id: "cosmoshub-4",
    name: ChainKey.GAIACHAIN,
    ticker: "ATOM",
  },
  {
    cmcId: 28324,
    decimals: 18,
    id: "dydx-1",
    name: ChainKey.DYDX,
    ticker: "DYDX",
  },
  {
    cmcId: 15185,
    decimals: 6,
    id: "kaiyo-1",
    name: ChainKey.KUJIRA,
    ticker: "KUJI",
  },
];

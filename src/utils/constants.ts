import keyMirror from "keymirror";

import type {
  ChainObjRef,
  ChainStrRef,
  CurrencyRef,
  LanguageRef,
} from "utils/interfaces";

export enum CosmosMsgType {
  MSG_SEND = "cosmos-sdk/MsgSend",
}

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
  TERRA = "Terra",
  TERRACLASSIC = "TerraClassic",
  THORCHAIN = "THORChain",
  TON = "TON",
  XRP = "XRP",
  ZKSYNC = "Zksync",
}

export enum MessageKey {
  BITCOIN_REQUEST = "bitcoin",
  BITCOIN_CASH_REQUEST = "bitcoincash",
  COSMOS_REQUEST = "cosmos",
  DASH_REQUEST = "dash",
  DOGECOIN_REQUEST = "dogecoin",
  ETHEREUM_REQUEST = "ethereum",
  LITECOIN_REQUEST = "litecoin",
  MAYA_REQUEST = "maya",
  SOLANA_REQUEST = "solana",
  THOR_REQUEST = "thor",
  PRIORITY = "priority",
  VAULTS = "vaults",
}

export enum SenderKey {
  PAGE = "page",
  RELAY = "relay",
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

export enum Instance {
  ACCOUNTS = "accounts",
  TRANSACTION = "transaction",
  VAULTS = "vaults",
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
  NETWORK_CHANGED = "networkChanged",
}

export enum TssKeysignType {
  ECDSA = "ECDSA",
  EdDSA = "EdDSA",
}

export namespace RequestMethod {
  export enum CTRL {
    DEPOSIT = "deposit",
    GET_UNSPENT_UTXOS = "get_unspent_utxos",
    REQUEST_ACCOUNTS_AND_KEYS = "request_accounts_and_keys",
    SIGN_MESSAGE = "sign_message",
    SIGN_PSBT = "sign_psbt",
    SIGN_TRANSACTION = "sign_transaction",
    TRANSFER = "transfer",
  }

  export enum METAMASK {
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
    NET_VERSION = "net_version",
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

  export enum VULTISIG {
    GET_ACCOUNTS = "get_accounts",
    CHAIN_ID = "chain_id",
    DEPOSIT_TRANSACTION = "deposit_transaction",
    GET_TRANSACTION_BY_HASH = "get_transaction_by_hash",
    REQUEST_ACCOUNTS = "request_accounts",
    SEND_TRANSACTION = "send_transaction",
    WALLET_ADD_CHAIN = "wallet_add_chain",
    WALLET_SWITCH_CHAIN = "wallet_switch_chain",
  }

  export enum THORCHAIN {
    // Account Management
    REQUEST_ACCOUNTS = "request_accounts",
    GET_ACCOUNTS = "get_accounts",
    // Transaction Management
    SEND_TRANSACTION = "send_transaction",
    DEPOSIT_TRANSACTION = "deposit_transaction",
    GET_TRANSACTION_BY_HASH = "get_transaction_by_hash",
  }
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

export const explorerUrl: ChainStrRef = {
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
  [ChainKey.KUJIRA]: "https://finder.kujira.network",
  [ChainKey.LITECOIN]: "https://blockchair.com/litecoin",
  [ChainKey.MAYACHAIN]: "https://www.mayascan.org",
  [ChainKey.OPTIMISM]: "https://optimistic.etherscan.io",
  [ChainKey.OSMOSIS]: "https://www.mintscan.io/osmosis",
  [ChainKey.POLKADOT]: "https://polkadot.subscan.io/account",
  [ChainKey.POLYGON]: "https://polygonscan.com",
  [ChainKey.SOLANA]: "https://explorer.solana.com",
  [ChainKey.SUI]: "",
  [ChainKey.TERRA]: "",
  [ChainKey.TERRACLASSIC]: "",
  [ChainKey.THORCHAIN]: "https://thorchain.net",
  [ChainKey.TON]: "https://tonscan.org/",
  [ChainKey.XRP]: "",
  [ChainKey.ZKSYNC]: "https://explorer.zksync.io",
};

export const rpcUrl: ChainStrRef = {
  [ChainKey.ARBITRUM]: "https://arbitrum-one-rpc.publicnode.com",
  [ChainKey.AVALANCHE]: "https://avalanche-c-chain-rpc.publicnode.com",
  [ChainKey.BASE]: "https://base-rpc.publicnode.com",
  [ChainKey.BITCOIN]: "",
  [ChainKey.BITCOINCASH]: "",
  [ChainKey.BLAST]: "https://rpc.ankr.com/blast",
  [ChainKey.BSCCHAIN]: "https://bsc-rpc.publicnode.com",
  [ChainKey.CRONOSCHAIN]: "https://cronos-evm-rpc.publicnode.com",
  [ChainKey.DASH]: "",
  [ChainKey.DOGECOIN]: "",
  [ChainKey.DYDX]: "https://dydx-rpc.publicnode.com",
  [ChainKey.ETHEREUM]: "https://ethereum-rpc.publicnode.com",
  [ChainKey.GAIACHAIN]: "https://cosmos-rpc.publicnode.com",
  [ChainKey.KUJIRA]: "https://kujira-rpc.publicnode.com",
  [ChainKey.LITECOIN]: "",
  [ChainKey.MAYACHAIN]: "",
  [ChainKey.OPTIMISM]: "https://optimism-rpc.publicnode.com",
  [ChainKey.OSMOSIS]: "https://osmosis-rpc.publicnode.com",
  [ChainKey.POLKADOT]: "",
  [ChainKey.POLYGON]: "https://polygon-bor-rpc.publicnode.com",
  [ChainKey.SOLANA]: "https://solana-rpc.publicnode.com",
  [ChainKey.SUI]: "",
  [ChainKey.TERRA]: "",
  [ChainKey.TERRACLASSIC]: "",
  [ChainKey.THORCHAIN]: "https://rpc.ninerealms.com/",
  [ChainKey.TON]: "",
  [ChainKey.XRP]: "https://rpc.ninerealms.com/",
  [ChainKey.ZKSYNC]: "https://mainnet.era.zksync.io",
};

export const chains: ChainObjRef = {
  [ChainKey.ARBITRUM]: {
    cmcId: 1027,
    decimals: 18,
    id: "0xa4b1",
    name: ChainKey.ARBITRUM,
    ticker: "ETH",
  },
  [ChainKey.AVALANCHE]: {
    cmcId: 5805,
    decimals: 18,
    id: "0xa86a",
    name: ChainKey.AVALANCHE,
    ticker: "AVAX",
  },
  [ChainKey.BASE]: {
    cmcId: 1027,
    decimals: 18,
    id: "0x2105",
    name: ChainKey.BASE,
    ticker: "ETH",
  },
  [ChainKey.BITCOIN]: {
    cmcId: 1,
    decimals: 8,
    id: "0x1f96",
    name: ChainKey.BITCOIN,
    ticker: "BTC",
  },
  [ChainKey.BITCOINCASH]: {
    cmcId: 1831,
    decimals: 8,
    id: "0x2710",
    name: ChainKey.BITCOINCASH,
    ticker: "BCH",
  },
  [ChainKey.BLAST]: {
    cmcId: 1027,
    decimals: 18,
    id: "0x13e31",
    name: ChainKey.BLAST,
    ticker: "ETH",
  },
  [ChainKey.BSCCHAIN]: {
    cmcId: 1839,
    decimals: 18,
    id: "0x38",
    name: ChainKey.BSCCHAIN,
    ticker: "BNB",
  },
  [ChainKey.CRONOSCHAIN]: {
    cmcId: 3635,
    decimals: 18,
    id: "0x19",
    name: ChainKey.CRONOSCHAIN,
    ticker: "CRO",
  },
  [ChainKey.DOGECOIN]: {
    cmcId: 74,
    decimals: 8,
    id: "0x7d0",
    name: ChainKey.DOGECOIN,
    ticker: "DOGE",
  },
  [ChainKey.DYDX]: {
    cmcId: 28324,
    decimals: 18,
    id: "dydx-1",
    name: ChainKey.DYDX,
    ticker: "DYDX",
  },
  [ChainKey.ETHEREUM]: {
    cmcId: 1027,
    decimals: 18,
    id: "0x1",
    name: ChainKey.ETHEREUM,
    ticker: "ETH",
  },
  [ChainKey.DASH]: {
    cmcId: 131,
    decimals: 8,
    id: "Dash_dash",
    name: ChainKey.DASH,
    ticker: "DASH",
  },
  [ChainKey.GAIACHAIN]: {
    cmcId: 3794,
    decimals: 6,
    id: "cosmoshub-4",
    name: ChainKey.GAIACHAIN,
    ticker: "ATOM",
  },
  [ChainKey.KUJIRA]: {
    cmcId: 15185,
    decimals: 6,
    id: "kaiyo-1",
    name: ChainKey.KUJIRA,
    ticker: "KUJI",
  },
  [ChainKey.LITECOIN]: {
    cmcId: 2,
    decimals: 8,
    id: "Litecoin_litecoin",
    name: ChainKey.LITECOIN,
    ticker: "LTC",
  },
  [ChainKey.MAYACHAIN]: {
    cmcId: 23534,
    decimals: 10,
    id: "MayaChain-1",
    name: ChainKey.MAYACHAIN,
    ticker: "CACAO",
  },
  [ChainKey.OPTIMISM]: {
    cmcId: 1027,
    decimals: 18,
    id: "Optimism_optimism",
    name: ChainKey.OPTIMISM,
    ticker: "ETH",
  },
  [ChainKey.OSMOSIS]: {
    cmcId: 12220,
    decimals: 6,
    id: "osmosis-1",
    name: ChainKey.OSMOSIS,
    ticker: "OSMO",
  },
  [ChainKey.POLYGON]: {
    cmcId: 3890,
    decimals: 18,
    id: "0x89",
    name: ChainKey.POLYGON,
    ticker: "MATIC",
  },
  [ChainKey.SOLANA]: {
    cmcId: 5426,
    decimals: 9,
    id: "Solana_mainnet-beta",
    name: ChainKey.SOLANA,
    ticker: "SOL",
  },
  [ChainKey.THORCHAIN]: {
    cmcId: 4157,
    decimals: 8,
    id: "Thorchain_1",
    name: ChainKey.THORCHAIN,
    ticker: "RUNE",
  },
};

export const cosmosChains: ChainKey[] = [
  ChainKey.DYDX,
  ChainKey.KUJIRA,
  ChainKey.GAIACHAIN,
  ChainKey.MAYACHAIN,
  ChainKey.OSMOSIS,
  ChainKey.THORCHAIN,
];

export const evmChains: ChainKey[] = [
  ChainKey.ARBITRUM,
  ChainKey.AVALANCHE,
  ChainKey.BASE,
  ChainKey.BSCCHAIN,
  ChainKey.CRONOSCHAIN,
  ChainKey.ETHEREUM,
  ChainKey.OPTIMISM,
  ChainKey.POLYGON,
];

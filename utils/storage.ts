import { ChainKey, chains, Currency, Language } from "~utils/constants";
import type {
  AccountsProps,
  ChainProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import i18n from "~i18n/config";

interface EthProviderState {
  accounts: string[];
  chainId: string;
  chainKey: ChainKey;
  isConnected: boolean;
}

export interface LocalStorage {
  accounts?: AccountsProps;
  chains?: ChainProps[];
  currency?: Currency;
  language?: Language;
  vaults?: VaultProps[];
  isPriority?: boolean;
  ethProviderState?: EthProviderState;
  transactions?: TransactionProps[];
}
export type LocalStorageKeys = keyof LocalStorage;

export const getStoredRequest = (): Promise<AccountsProps> => {
  const keys: LocalStorageKeys[] = ["accounts"];

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      res.accounts ? resolve(res.accounts) : reject();
    });
  });
};

export const setStoredRequest = (accounts: AccountsProps): Promise<void> => {
  const vals: LocalStorage = { accounts };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredChains = (): Promise<ChainProps[]> => {
  const keys: LocalStorageKeys[] = ["chains"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      if (res.chains?.length) {
        resolve(res.chains);
      } else {
        const defaultChain = chains.find(
          ({ name }) => name === ChainKey.ETHEREUM
        );
        resolve([{ ...defaultChain, active: true }]);
      }
    });
  });
};

export const setStoredChains = (chains: ChainProps[]): Promise<void> => {
  const vals: LocalStorage = { chains };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredCurrency = (): Promise<Currency> => {
  const keys: LocalStorageKeys[] = ["currency"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.currency ?? Currency.USD);
    });
  });
};

export const setStoredCurrency = (currency: Currency): Promise<void> => {
  const vals: LocalStorage = { currency };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredLanguage = (): Promise<Language> => {
  const keys: LocalStorageKeys[] = ["language"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.language ?? Language.ENGLISH);
    });
  });
};

export const setStoredLanguage = (language: Language): Promise<void> => {
  const vals: LocalStorage = { language };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      i18n.changeLanguage(language ?? Language.ENGLISH);

      resolve();
    });
  });
};

export const getStoredVaults = (): Promise<VaultProps[]> => {
  const keys: LocalStorageKeys[] = ["vaults"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.vaults ?? []);
    });
  });
};

export const setStoredVaults = (vaults: VaultProps[]): Promise<void> => {
  const vals: LocalStorage = { vaults };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const setStoredTransaction = (
  transaction: TransactionProps
): Promise<void> => {
  return new Promise((resolve) => {
    getStoredVaults().then((vaults) => {
      setStoredVaults(
        vaults.map((vault) => ({
          ...vault,
          transactions: vault.transactions.map((t) =>
            t.id === transaction.id ? transaction : t
          ),
        }))
      ).then(resolve);
    });
  });
};

export const getIsPriority = (): Promise<boolean> => {
  const keys: LocalStorageKeys[] = ["isPriority"];
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.isPriority ?? true);
    });
  });
};

export const setIsPriority = (isPriority: boolean): Promise<void> => {
  const vals: LocalStorage = { isPriority };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredEthProviderState = (): Promise<EthProviderState> => {
  const keys: LocalStorageKeys[] = ["ethProviderState"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(
        res.ethProviderState ?? {
          accounts: [],
          chainId: "0x1",
          chainKey: ChainKey.ETHEREUM,
          isConnected: false,
        }
      );
    });
  });
};

export const setStoredEthProviderState = (
  ethProviderState: EthProviderState
): Promise<void> => {
  const vals: LocalStorage = { ethProviderState };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredTransactions = (): Promise<TransactionProps[]> => {
  const keys: LocalStorageKeys[] = ["transactions"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.transactions ?? []);
    });
  });
};

export const setStoredTransactions = (
  transactions: TransactionProps[]
): Promise<void> => {
  const vals: LocalStorage = { transactions };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

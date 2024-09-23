import { ChainKey, chains, Currency, Language } from "~utils/constants";
import type { AccountsProps, ChainProps, VaultProps } from "~utils/interfaces";
import i18n from "~i18n/config";

export interface LocalStorage {
  accounts?: AccountsProps;
  chains?: ChainProps[];
  currency?: Currency;
  language?: Language;
  vaults?: VaultProps[];
}
const defaultChain = chains.find(({ chain }) => chain === ChainKey.ETHEREUM);
export type LocalStorageKeys = keyof LocalStorage;

export const setStoredAccounts = (accounts: AccountsProps): Promise<void> => {
  const vals: LocalStorage = { accounts };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredAccounts = (): Promise<AccountsProps> => {
  const keys: LocalStorageKeys[] = ["accounts"];

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      res.accounts ? resolve(res.accounts) : reject();
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

export const getStoredChains = (): Promise<ChainProps[]> => {
  const keys: LocalStorageKeys[] = ["chains"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.chains ?? [{ ...defaultChain, active: true }]);
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

export const getStoredCurrency = (): Promise<Currency> => {
  const keys: LocalStorageKeys[] = ["currency"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.currency ?? Currency.USD);
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

export const getStoredLanguage = (): Promise<Language> => {
  const keys: LocalStorageKeys[] = ["language"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.language ?? Language.ENGLISH);
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

export const getStoredVaults = (): Promise<VaultProps[]> => {
  const keys: LocalStorageKeys[] = ["vaults"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.vaults ?? []);
    });
  });
};

import type { VaultProps } from "~utils/interfaces";
import { ChainKey, Currency, Language } from "~utils/constants";
import i18n from "~i18n/config";

export interface StoredAccounts {
  addresses: string[];
  chain: ChainKey;
  favicon: string;
  origin: string;
}

export interface LocalStorage {
  accounts?: StoredAccounts;
  currency?: Currency;
  language?: Language;
  vaults?: VaultProps[];
}

export type LocalStorageKeys = keyof LocalStorage;

export const setStoredAccounts = (accounts: StoredAccounts): Promise<void> => {
  const vals: LocalStorage = { accounts };

  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
};

export const getStoredAccounts = (): Promise<StoredAccounts> => {
  const keys: LocalStorageKeys[] = ["accounts"];

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      res.accounts ? resolve(res.accounts) : reject();
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
      i18n.changeLanguage(language);

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

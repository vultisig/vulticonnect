import { Currency, Language } from "~utils/constants";
import {
  setStoredChains,
  setStoredCurrency,
  setStoredLanguage,
  setStoredVaults,
} from "~utils/storage";

chrome.runtime.onInstalled.addListener(() => {
  setStoredCurrency(Currency.USD);
  setStoredLanguage(Language.ENGLISH);
  setStoredVaults([]);
  setStoredChains([]);
});

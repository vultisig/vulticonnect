import { ChainKey, Currency, Language, chains } from "~utils/constants";
import {
  setStoredChains,
  setStoredCurrency,
  setStoredLanguage,
  setStoredVaults,
} from "~utils/storage";

const defaultChain = chains.find(({ chain }) => chain === ChainKey.ETHEREUM);

chrome.runtime.onInstalled.addListener(() => {
  setStoredCurrency(Currency.USD);
  setStoredLanguage(Language.ENGLISH);
  setStoredVaults([]);
  setStoredChains([{ ...defaultChain, active: true }]);
});

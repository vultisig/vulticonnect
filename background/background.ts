import { startHub } from "@plasmohq/messaging/pub-sub";
import "@plasmohq/messaging/background";

import { Currency, Language } from "~utils/constants";
import {
  setStoredCurrency,
  setStoredLanguage,
  setStoredVaults,
} from "~utils/storage";

chrome.runtime.onInstalled.addListener(() => {
  setStoredCurrency(Currency.USD);
  setStoredLanguage(Language.ENGLISH);
  setStoredVaults([]);
});

console.log(`BGSW - Starting Hub`);
startHub();

import { Currency, Language } from "~utils/constants";
import {
  setStoredChains,
  setStoredCurrency,
  setStoredLanguage,
  setStoredVaults,
} from "~utils/storage";

import "~styles/index.scss";

const Component = () => {
  setStoredCurrency(Currency.USD);
  setStoredLanguage(Language.ENGLISH);
  setStoredVaults([]);
  setStoredChains([]);
};

export default Component;

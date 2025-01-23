import { useEffect, useState } from "react";
import i18n from "i18n/config";
import {
  getStoredLanguage,
  getStoredRequest,
  getStoredVaults,
} from "utils/storage";
import messageKeys from "utils/message-keys";
import { VaultProps } from "utils/interfaces";

interface InitializationState {
  chain?: string;
  sender?: string;
  vaults: VaultProps[];
  hasError: boolean;
  errorTitle?: string;
  errorDescription?: string;
}

export const usePageInitialization = (t: (key: string) => string) => {
  const [state, setState] = useState<InitializationState>({
    vaults: [],
    hasError: false,
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        const language = await getStoredLanguage();
        i18n.changeLanguage(language);

        const { chain, sender } = await getStoredRequest();
        const vaults = await getStoredVaults();

        if (vaults.length > 0) {
          setState({
            chain,
            sender,
            vaults,
            hasError: false,
          });
        } else {
          setState({
            hasError: true,
            errorTitle: t(messageKeys.GET_VAULT_FAILED),
            errorDescription: t(messageKeys.GET_VAULT_FAILED_DESCRIPTION),
            vaults: [],
          });
        }
      } catch (error) {
        setState({
          hasError: true,
          errorTitle: t(messageKeys.ERROR_LOADING_PAGE),
          errorDescription: t(messageKeys.GENERAL_ERROR_MESSAGE),
          vaults: [],
        });
      }
    };

    initializePage();
  }, [t]);

  return state;
};

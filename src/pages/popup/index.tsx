import { StrictMode, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";
import { getStoredLanguage } from "utils/storage";
import i18n from "i18n/config";

import ConfigProvider from "components/config-provider";
import Routing from "pages/popup/routes";

import "styles/index.scss";
import "pages/popup/index.scss";
import { usePageInitialization } from "~src/hooks/usePageInitialization";

const Component = () => {
  const { t } = useTranslation();

  useEffect(() => {
    usePageInitialization(t);
  }, []);

  return (
    <ConfigProvider>
      <Routing />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>
);

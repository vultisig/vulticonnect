import { useEffect, type FC } from "react";

import { getStoredLanguage } from "~utils/storage";
import i18n from "~i18n/config";

import ConfigProvider from "~components/config-provider";
import Routing from "~popup/routes";

import "~styles/index.scss";
import "~popup/index.scss";

const Component: FC = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      <Routing />
    </ConfigProvider>
  );
};

export default Component;

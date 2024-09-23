import { useEffect, type FC } from "react";
import { ConfigProvider } from "antd";

import { themeConfig } from "~utils/constants";
import { getStoredLanguage } from "~utils/storage";
import i18n from "~i18n/config";

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
    <ConfigProvider theme={themeConfig}>
      <Routing />
    </ConfigProvider>
  );
};

export default Component;

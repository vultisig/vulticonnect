import { useEffect, type FC } from "react";
import { ConfigProvider, theme } from "antd";

import { getStoredLanguage } from "~utils/storage";
import i18n from "~i18n/config";

import Routing from "~popup/routes";

import "~popup/index.scss";

const Component: FC = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 12,
          colorPrimary: "#33e6bf",
          colorTextLightSolid: "#02122b",
          fontFamily: "Montserrat",
        },
      }}
    >
      <Routing />
    </ConfigProvider>
  );
};

export default Component;

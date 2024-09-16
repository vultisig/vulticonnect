import { useEffect, useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Empty, Switch } from "antd";

import { getStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import messageKeys from "~utils/message-keys";
import routerKeys from "~utils/route-keys";

import { BrokenLinkBold, ChevronRight, SettingsGear, Vultisig } from "~icons";
import routeKeys from "~utils/route-keys";

interface InitialState {
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const navigate = useNavigate();

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active) ?? vaults[0];

      setState((prevState) => ({ ...prevState, vault }));
    });
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <div className="layout main-page">
      <div className="header">
        <Vultisig className="logo-shape" />
        <span className="logo-type">{t(messageKeys.VULTISIG)}</span>
        <SettingsGear
          className="icon icon-right"
          onClick={() => navigate(routeKeys.settings.root, { state: true })}
        />
      </div>
      <div className="content">
        <Link to={routeKeys.vaults} state={true} className="vault">
          <span className="name">{vault.name}</span>
          <ChevronRight className="icon" />
        </Link>
        <span className="divider">{t(messageKeys.CONNECTED_DAPPS)}</span>
        <div className="apps">
          <div className="action">
            {t(messageKeys.VULTISIG_WEB3)}
            <Switch />
          </div>
          {true ? (
            <>
              <div className="item">
                <span className="btn">
                  <BrokenLinkBold />
                  {t(messageKeys.UNLINK)}
                </span>
              </div>
              <div className="item">
                <span className="btn">
                  <BrokenLinkBold />
                  {t(messageKeys.UNLINK)}
                </span>
              </div>
            </>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Component;

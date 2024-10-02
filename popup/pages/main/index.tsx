import { useEffect, useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Empty, Modal, Switch } from "antd";

import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import messageKeys from "~utils/message-keys";

import { BrokenLinkBold, ChevronRight, SettingsGear, Vultisig } from "~icons";
import routeKeys from "~utils/route-keys";

interface InitialState {
  vault?: VaultProps;
}

const ConnectedApp: FC<{
  domain: string;
  onUnlink: () => void;
}> = ({ domain, onUnlink }) => {
  const { t } = useTranslation();
  const [sld, tld] = domain.split(".").slice(-2);

  return (
    <>
      <div className="item">
        <span className="name">{`${sld}.${tld}`}</span>
        <span className="btn" onClick={onUnlink}>
          <BrokenLinkBold />
          {t(messageKeys.UNLINK)}
        </span>
      </div>
    </>
  );
};

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();

  const handleUnlink = (app: string): void => {
    modal.confirm({
      title: "Confirm",
      width: 312,
      onOk() {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((item) =>
              item.uid === vault.uid
                ? { ...item, apps: item.apps.filter((item) => item !== app) }
                : item
            )
          ).then(() => {
            componentDidMount();
          });
        });
      },
    });
  };

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);

      setState((prevState) => ({ ...prevState, vault }));
    });
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <>
      <div className="layout main-page">
        <div className="header">
          <Vultisig className="logo" />
          <span className="logo-type">{t(messageKeys.VULTISIG)}</span>
          <SettingsGear
            className="icon icon-right"
            onClick={() => navigate(routeKeys.settings.root, { state: true })}
          />
        </div>
        <div className="content">
          <div className="list list-action list-arrow">
            <Link to={routeKeys.vaults} state={true} className="list-item">
              <span className="label">{vault.name}</span>
              <ChevronRight className="action" />
            </Link>
          </div>
          <span className="divider">{t(messageKeys.CONNECTED_DAPPS)}</span>
          <div className="apps">
            <div className="action">
              {t(messageKeys.VULTISIG_WEB3)}
              <Switch />
            </div>
            {vault.apps.length ? (
              vault.apps.map((app) => (
                <ConnectedApp
                  key={app}
                  domain={app}
                  onUnlink={() => handleUnlink(app)}
                />
              ))
            ) : (
              <Empty />
            )}
          </div>
        </div>
      </div>

      {contextHolder}
    </>
  ) : (
    <></>
  );
};

export default Component;

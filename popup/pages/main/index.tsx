import { useEffect, useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Empty, message, Modal, Switch, Tooltip } from "antd";

import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { Messaging, VaultProps } from "~utils/interfaces";
import messageKeys from "~utils/message-keys";

import { BrokenLinkBold, ChevronRight, SettingsGear, Vultisig } from "~icons";
import routeKeys from "~utils/route-keys";
import {
  sendToBackground,
  sendToBackgroundViaRelay,
} from "@plasmohq/messaging";

interface InitialState {
  vault?: VaultProps;
  isPriority: boolean;
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
  const initialState: InitialState = { isPriority: false };
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const [messageApi, messageContextHolder] = message.useMessage();
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

  const handlePriority = async (checked) => {
    sendToBackground<
      Messaging.SetPriority.Request,
      Messaging.SetPriority.Response
    >({
      name: "set-priority",
      body: { priority: checked },
    }).then((isPriority) => {
      setState((prevState) => ({ ...prevState, isPriority: isPriority }));
      showReloadMessage();
    });
  };

  const showReloadMessage = () => {
    messageApi.open({
      type: "info",
      content: t(t(messageKeys.REALOAD_MESSAGE)),
    });
  };
  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);
      sendToBackground<
        Messaging.SetPriority.Request,
        Messaging.SetPriority.Response
      >({
        name: "set-priority",
      }).then((isPriority) => {
        setState((prevState) => ({ ...prevState, isPriority: isPriority }));
      });
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
              <div className="title">
                {t(messageKeys.PRIORITIZE_VULTICONNECT)}
                <Tooltip title={t(messageKeys.PRIORITIZE_VULTICONNECT_HINT)}>
                  <img src="/static/icons/info.svg" className="icon" />
                </Tooltip>
              </div>
              <Switch
                checked={state.isPriority}
                onChange={(checked) => handlePriority(checked)}
              />
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
              <Empty description={t(messageKeys.NO_CONNECTED_APP)}  />
            )}
          </div>
        </div>
      </div>
      {messageContextHolder}
      {contextHolder}
    </>
  ) : (
    <></>
  );
};

export default Component;

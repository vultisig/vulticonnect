import { useEffect, useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, message, Modal, Select, Switch, Tooltip } from "antd";

import {
  getIsPriority,
  getStoredChains,
  getStoredVaults,
  setIsPriority,
  setStoredChains,
  setStoredVaults,
} from "~utils/storage";
import type { Messaging, VaultProps } from "~utils/interfaces";
import messageKeys from "~utils/message-keys";
import { BrokenLinkBold, ChevronRight, SettingsGear, Vultisig } from "~icons";
import routeKeys from "~utils/route-keys";
import {
  chains,
  EventMethod,
  evmSupportedChains,
  RequestMethod,
} from "~utils/constants";
import { sendToBackground } from "@plasmohq/messaging";
interface SelectOption {
  value: string;
  label: JSX.Element;
}
interface InitialState {
  vault?: VaultProps;
  isPriority: boolean;
  networkOptions?: SelectOption[];
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
  const [selectedNetwork, setSelectedNetwork] = useState<{
    value: string;
    label: JSX.Element;
  }>();

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

  const handleViewinWeb = () => {
    const VULTISIG_WEB_URL = "https://airdrop.vultisig.com";
    const url = `${VULTISIG_WEB_URL}/redirect/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`;
    chrome.tabs.create({ url });
  };

  const getCurrentNetwork = (options: SelectOption[]) => {
    getStoredChains().then((chains) => {
      const currentChain = chains.find(({ active }) => active);

      const current = options.find(
        (option) => option.value === currentChain.id
      );
      setSelectedNetwork(current);
    });
  };

  const handleChangeNetwork = (value) => {
    const currentNetwork = state.networkOptions.find(
      (option) => option.value === value
    );
    setStoredChains(
      chains.map((chain) => ({
        ...chain,
        active: chain.id === value,
      }))
    ).then(() => {
      setSelectedNetwork(currentNetwork);
    });
  };

  const handlePriority = async (checked) => {
    setIsPriority(checked).then(() => {
      setState((prevState) => ({ ...prevState, isPriority: checked }));
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
      const vaultSupportedChains = vault.chains.filter((vaultChain) =>
        evmSupportedChains.some((chain) => chain.id === vaultChain.id)
      );
      const supportedChains = vaultSupportedChains.map((chain) => {
        return {
          value: chain.id,
          label: (
            <>
              <div className="chain-item">
                <img
                  src={`/static/icons/chains/${chain.name.toLowerCase()}.svg`}
                  alt={chain.name}
                  style={{ width: 20, marginRight: 8 }}
                />
                {chain.name}
              </div>
              <span className="address">{chain.address}</span>
            </>
          ),
        };
      });
      setState({ ...state, networkOptions: supportedChains });
      getCurrentNetwork(supportedChains);
      getIsPriority().then((isPriority) => {
        setState((prevState) => ({ ...prevState, isPriority }));
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
          <div className="view">
            <Button onClick={handleViewinWeb} shape="round" block>
              {t(messageKeys.VIEW_IN_WEB)}
            </Button>
          </div>
          <span className="divider">{t(messageKeys.CURRENT_NETWORK)}</span>
          <div>
            <Select
              className="select"
              options={state.networkOptions}
              value={selectedNetwork}
              onChange={(value) => handleChangeNetwork(value)}
            />
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
              <Empty description={t(messageKeys.NO_CONNECTED_APP)} />
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

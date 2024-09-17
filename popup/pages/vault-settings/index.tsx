import { useEffect, useState, type FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import useGoBack from "~hooks/go-back";
import messageKeys from "~utils/message-keys";
import routeKeys from "~utils/route-keys";

import { ChevronLeft, ChevronRight, EditShape, TrashShape } from "~icons";

interface InitialState {
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const goBack = useGoBack();

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);

      setState((prevState) => ({ ...prevState, vault }));
    });
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout vault-settings-page">
      <div className="header">
        <span className="heading">{vault?.name}</span>
        <ChevronLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.settings.root)}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link
            to={routeKeys.settings.rename}
            state={true}
            className="list-item"
          >
            <EditShape className="icon" />
            <span className="label">{t(messageKeys.RENAME_VAULT)}</span>
            <ChevronRight className="action" />
          </Link>
          <Link
            to={routeKeys.settings.delete}
            state={true}
            className="list-item warning"
          >
            <TrashShape className="icon" />
            <span className="label">{t(messageKeys.DELETE_VAULT)}</span>
            <ChevronRight className="action" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Component;

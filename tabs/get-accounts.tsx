import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Form } from "antd";

import { ChainKey, errorKey } from "~utils/constants";
import {
  getStoredLanguage,
  getStoredRequest,
  getStoredVaults,
  setStoredVaults,
} from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import i18n from "~i18n/config";
import messageKeys from "~utils/message-keys";

import { Vultisig } from "~icons";
import ConfigProvider from "~components/config-provider";
import MiddleTruncate from "~components/middle-truncate";
import VultiLoading from "~components/vulti-loading";

import "~styles/index.scss";
import "~tabs/get-accounts.scss";
import VultiError from "~components/vulti-error";

interface FormProps {
  uids: string[];
}

interface InitialState {
  chain?: ChainKey;
  sender?: string;
  vaults: VaultProps[];
  hasError: boolean;
  errorTitle: string;
  errorDescription: string;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    vaults: [],
    hasError: false,
    errorTitle: "",
    errorDescription: "",
  };
  const [state, setState] = useState(initialState);
  const { chain, sender, vaults } = state;
  const [form] = Form.useForm();

  const handleClose = () => {
    window.close();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ uids }: FormProps) => {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((vault) => ({
              ...vault,
              apps:
                uids.indexOf(vault.uid) >= 0
                  ? [sender, ...vault.apps.filter((app) => app !== sender)]
                  : vault.apps,
            }))
          ).then(() => {
            handleClose();
          });
        });
      })
      .catch(() => {});
  };

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredRequest()
        .then(({ chain, sender }) => {
          getStoredVaults().then((vaults) => {
            if (vaults.length) {
              setState((prevState) => ({
                ...prevState,
                chain,
                sender,
                vaults,
                hasError: false,
              }));

              form.setFieldsValue({
                uids: vaults
                  .filter(({ apps }) => apps.indexOf(sender) >= 0)
                  .map(({ uid }) => uid),
              });
            } else {
              setState((prevState) => ({
                ...prevState,
                hasError: true,
                errorTitle: messageKeys.GET_VAULT_FAILED,
                errorDescription: messageKeys.GET_VAULT_FAILED_DESCRIPTION,
              }));
              console.error(errorKey.FAIL_TO_GET_ACCOUNTS);
            }
          });
        })
        .catch(() => {});
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      {vaults.length ? (
        <div className="layout">
          <div className="header">
            <Vultisig className="logo" />
            <span className="title">
              {t(messageKeys.CONNECT_WITH_VULTISIG)}
            </span>
            <span className="origin">{sender}</span>
          </div>
          <div className="content">
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item<FormProps> name="uids" rules={[{ required: true }]}>
                <Checkbox.Group>
                  {vaults.map(({ chains, name, uid }) => (
                    <Checkbox key={uid} value={uid}>
                      <span className="name">{name}</span>
                      <MiddleTruncate
                        text={
                          chains.find(({ name }) => name === chain)?.address ??
                          ""
                        }
                      />
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Button htmlType="submit" />
            </Form>
          </div>
          <div className="footer">
            <Button onClick={handleClose} shape="round" block>
              {t(messageKeys.CANCEL)}
            </Button>
            <Button onClick={handleSubmit} type="primary" shape="round" block>
              {t(messageKeys.CONNECT)}
            </Button>
          </div>
        </div>
      ) : !state.hasError ? (
        <VultiLoading />
      ) : (
        <VultiError
          title={t(state.errorTitle)}
          description={t(state.errorDescription)}
        />
      )}
    </ConfigProvider>
  );
};

export default Component;

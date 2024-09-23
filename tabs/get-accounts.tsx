import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, ConfigProvider, Form } from "antd";

import { themeConfig } from "~utils/constants";
import {
  getStoredAccounts,
  getStoredLanguage,
  getStoredVaults,
  setStoredAccounts,
} from "~utils/storage";
import i18n from "~i18n/config";
import messageKeys from "~utils/message-keys";

import { Vultisig } from "~icons";

import "~styles/index.scss";
import "~tabs/get-accounts.scss";

interface FormProps {
  addresses: string[];
}

interface InitialState {
  sender?: string;
  vaults: { address: string; name: string }[];
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { vaults: [] };
  const [state, setState] = useState(initialState);
  const { sender, vaults } = state;
  const [form] = Form.useForm();

  const handleClose = () => {
    window.close();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ addresses }: FormProps) => {
        getStoredAccounts().then((accounts) => {
          setStoredAccounts({ ...accounts, addresses }).then(() => {
            handleClose();
          });
        });
      })
      .catch(() => {});
  };

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredAccounts()
        .then((accounts) => {
          getStoredVaults().then((vaults) => {
            setState((prevState) => ({
              ...prevState,
              vaults: vaults.map((vault) => ({
                address:
                  vault.chains.find(
                    ({ chain }) => chain === accounts.chain?.chain
                  )?.address ?? "",
                name: vault.name,
              })),
              sender: accounts.sender,
            }));
          });
        })
        .catch(() => {});
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="layout">
        <div className="header">
          <Vultisig className="logo" />
          <span className="title">{t(messageKeys.CONNECT_WITH_VULTISIG)}</span>
          <span className="origin">{sender}</span>
        </div>
        <div className="content">
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item<FormProps> name="addresses" rules={[{ required: true }]}>
              <Checkbox.Group>
                {vaults.map(({ address, name }) => (
                  <Checkbox key={address} value={address}>
                    <span className="name">{name}</span>
                    <span className="address">{address}</span>
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
    </ConfigProvider>
  );
};

export default Component;

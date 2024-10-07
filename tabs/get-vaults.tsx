import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Form } from "antd";

import { errorKey } from "~utils/constants";
import {
  getStoredLanguage,
  getStoredVaults,
  setStoredVaults,
} from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import i18n from "~i18n/config";
import messageKeys from "~utils/message-keys";

import { Vultisig } from "~icons";
import ConfigProvider from "~components/config-provider";
import VultiLoading from "~components/vulti-loading";

import "~styles/index.scss";
import "~tabs/get-vaults.scss";

interface FormProps {
  uids: string[];
}

interface InitialState {
  vaults: VaultProps[];
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { vaults: [] };
  const [state, setState] = useState(initialState);
  const { vaults } = state;
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
              selected: uids.indexOf(vault.uid) >= 0,
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

      getStoredVaults().then((vaults) => {
        if (vaults.length) {
          setState((prevState) => ({ ...prevState, vaults }));
        } else {
          console.error(errorKey.FAIL_TO_GET_VAULTS);
        }
      });
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
          </div>
          <div className="content">
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item<FormProps> name="uids" rules={[{ required: true }]}>
                <Checkbox.Group>
                  {vaults.map(({ name, uid }) => (
                    <Checkbox key={uid} value={uid}>
                      <span className="name">{name}</span>
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
      ) : (
        <VultiLoading />
      )}
    </ConfigProvider>
  );
};

export default Component;

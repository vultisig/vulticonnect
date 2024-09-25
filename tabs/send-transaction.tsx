import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, ConfigProvider, QRCode } from "antd";
import { formatUnits } from "ethers";
import { v4 as uuidv4 } from "uuid";

import { themeConfig } from "~utils/constants";
import { hexToAscii } from "~utils/functions";
import { getStoredLanguage, getStoredVaults } from "~utils/storage";
import { estimateTransactionFee } from "~utils/evm-api";
import type { TransactionProps, VaultProps } from "~utils/interfaces";
import useSendKey from "~hooks/get-send-key";
import i18n from "~i18n/config";
import messageKeys from "~utils/message-keys";

import { ChevronLeft } from "~icons";

import "~styles/index.scss";
import "~tabs/send-transaction.scss";
import api from "~utils/api";

interface InitialState {
  gasPrice?: string;
  loading: boolean;
  sendKey?: string;
  step: number;
  transaction?: TransactionProps;
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loading: false,
    step: 1,
  };
  const [state, setState] = useState(initialState);
  const { gasPrice, loading, sendKey, step, transaction, vault } = state;
  const getSendKey = useSendKey();

  const handleApp = () => {
    window.open(sendKey, "_blannk");
  };

  const handleSocket = (status: "" | "start" | "complete"): void => {
    api.transaction.get(status, transaction.id).then(({ data }) => {
      if (data?.length > 1) {
        if (status === "") {
          api.transaction.set(data, transaction.id).then(() => {
            setState((prevState) => ({ ...prevState, step: 3 }));

            setTimeout(() => {
              handleSocket("start");
            }, 1000);
          });
        } else if (status === "start") {
          setTimeout(() => {
            handleSocket("complete");
          }, 1000);
        } else {
          handleStep(4);
        }
      } else {
        setTimeout(() => {
          handleSocket(status);
        }, 1000);
      }
    });
  };

  const handleFinish = (): void => {
    window.close();
  };

  const handleStep = (step: number): void => {
    switch (step) {
      case 2: {
        if (sendKey) {
          setState((prevState) => ({ ...prevState, step }));
        } else {
          setState((prevState) => ({ ...prevState, loading: true }));

          getSendKey(transaction, vault)
            .then((sendKey) => {
              setState((prevState) => ({
                ...prevState,
                loading: false,
                sendKey,
                step,
              }));

              handleSocket("");
            })
            .catch(() => {
              setState((prevState) => ({ ...prevState, loading: false }));
            });
        }

        break;
      }
      default: {
        setState((prevState) => ({ ...prevState, step }));

        break;
      }
    }
  };

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredVaults().then((vautls) => {
        const vault = vautls.find(({ active }) => active);
        const [transaction] = vault.transactions;

        estimateTransactionFee(transaction.chain).then((gasPrice) => {
          setState((prevState) => ({
            ...prevState,
            gasPrice,
            vault,
            transaction: {
              ...transaction,
              //id: uuidv4(),
              data: hexToAscii(transaction.data ?? ""),
              value: formatUnits(
                transaction.value,
                transaction.decimals
              ).toString(),
            },
          }));
        });
      });
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider theme={themeConfig}>
      {transaction && (
        <div className={`layout step-${step}`}>
          <div className="header">
            <span className="heading">
              {t(
                step === 1
                  ? messageKeys.VERIFY_SEND
                  : step === 4
                  ? messageKeys.TRANSACTION_SUCCESSFUL
                  : messageKeys.SIGN_TRANSACTION
              )}
            </span>
            {step === 2 && (
              <ChevronLeft
                onClick={() => handleStep(1)}
                className="icon icon-left"
              />
            )}
            <span
              className="progress"
              style={{ width: `${(100 / 4) * step}%` }}
            />
          </div>
          {step === 1 ? (
            <>
              <div className="content">
                <span className="divider">
                  {t(messageKeys.TRANSACTION_DETAILS)}
                </span>
                <div className="list">
                  <div className="list-item">
                    <span className="label">{t(messageKeys.FROM)}</span>
                    <span className="address">{transaction.from}</span>
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TO)}</span>
                    <span className="address">{transaction?.to}</span>
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.AMOUNT)}</span>
                    <span className="extra">{`${transaction.value} ${transaction.ticker}`}</span>
                  </div>
                  {transaction.data && (
                    <div className="list-item">
                      <span className="label">{t(messageKeys.MEMO)}</span>
                      <span className="extra">{transaction.data}</span>
                    </div>
                  )}
                  <div className="list-item">
                    <span className="label">Est. Network Fee</span>
                    <span className="extra">
                      {Number(gasPrice).toLocaleString()} Gwei
                    </span>
                  </div>
                </div>
              </div>
              <div className="footer">
                <Button
                  loading={loading}
                  onClick={() => handleStep(2)}
                  type="primary"
                  shape="round"
                  block
                >
                  {t(messageKeys.SIGN)}
                </Button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="content">
                <span className="hint">Scan QR code with pair device</span>
                <QRCode size={312} value={sendKey} />
              </div>
              <div className="footer">
                <Button type="primary" shape="round" block>
                  {t(messageKeys.FAST_SIGN)}
                </Button>
                <Button onClick={handleApp} type="default" shape="round" block>
                  Open Desktop App
                </Button>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div className="content">
                <div className="vulti-loading" />
                <span className="message">Signing</span>
              </div>
            </>
          ) : (
            <>
              <div className="content"></div>
              <div className="footer">
                <Button
                  onClick={handleFinish}
                  type="primary"
                  shape="round"
                  block
                >
                  {t(messageKeys.DONE)}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </ConfigProvider>
  );
};

export default Component;

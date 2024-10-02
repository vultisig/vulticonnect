import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, ConfigProvider, QRCode, message } from "antd";
import { formatUnits, toUtf8String } from "ethers";

import type { KeysignPayload } from "~protos/keysign_message_pb";

import { Currency, explorerUrl, themeConfig } from "~utils/constants";
import {
  getStoredCurrency,
  getStoredLanguage,
  getStoredVaults,
  setStoredVaults,
} from "~utils/storage";
import type {
  ChainProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import i18n from "~i18n/config";
import api from "~utils/api";
import SignAPI from "~utils/sign-api";
import useWalletCore from "~hooks/get-wallet-core";
import messageKeys from "~utils/message-keys";

import {
  ChevronLeft,
  QRCodeBorder,
  SquareArrow,
  SquareBehindSquare,
} from "~icons";
import MiddleTruncate from "~components/middle-truncate";

import "~styles/index.scss";
import "~tabs/send-transaction.scss";
import "~utils/prototypes";
import useEncoder from "~hooks/encode-data";

interface InitialState {
  signAPI?: SignAPI;
  chain?: ChainProps;
  currency?: Currency;
  gasPrice?: number;
  loading: boolean;
  sendKey?: string;
  step: number;
  transaction?: TransactionProps;
  txHash?: string;
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false, step: 1 };
  const [state, setState] = useState(initialState);
  const {
    chain,
    currency,
    gasPrice,
    loading,
    sendKey,
    signAPI,
    step,
    transaction,
    txHash,
    vault,
  } = state;
  const [messageApi, contextHolder] = message.useMessage();
  const dataEncoder = useEncoder();
  const getWalletCore = useWalletCore();

  const handleApp = () => {
    window.open(sendKey, "_self");
  };

  const handleClose = (): void => {
    window.close();
  };

  const handleCopy = (data: string) => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        messageApi.open({
          type: "success",
          content: "Transaction link copied to clipboard",
        });
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: "Failed to copy transaction link",
        });
      });
  };

  const handlePending = (preSignedImageHash: string) => {
    api.transaction
      .getComplete(transaction.id, preSignedImageHash)
      .then(({ data }) => {
        signAPI
          .getSignedTransaction(transaction, data)
          .then((txHash) => {
            handleStatus("success").then(() => {
              setState((prevState) => ({ ...prevState, step: 4, txHash }));
            });
          })
          .catch((error) => {});
      })
      .catch(({ status }) => {
        if (status === 404) {
          setTimeout(() => {
            handlePending(preSignedImageHash);
          }, 1000);
        } else {
          handleStatus("error").then(() => {
            handleClose();
          });
        }
      });
  };

  const handleStart = (keysignPayload: KeysignPayload) => {
    api.transaction
      .getDevices(transaction.id)
      .then(({ data }) => {
        if (data?.length > 1) {
          api.transaction.setStart(transaction.id, data).then(() => {
            handleStatus("pending").then(() => {
              signAPI
                .getPreSignedInputData(keysignPayload)
                .then((preSignedInputData) => {
                  signAPI
                    .getPreSignedImageHash(preSignedInputData)
                    .then((preSignedImageHash) => {
                      setState((prevState) => ({ ...prevState, step: 3 }));

                      handlePending(preSignedImageHash);
                    });
                });
            });
          });
        } else {
          setTimeout(() => {
            handleStart(keysignPayload);
          }, 1000);
        }
      })
      .catch(() => {
        handleStatus("error").then(() => {
          handleClose();
        });
      });
  };

  const handleStatus = (
    status: "error" | "pending" | "success"
  ): Promise<void> => {
    return new Promise((resolve) => {
      getStoredVaults().then((vaults) => {
        setStoredVaults(
          vaults.map((vault) => ({
            ...vault,
            transactions: vault.transactions.map((item) => ({
              ...item,
              status: item.id === transaction.id ? status : item.status,
            })),
          }))
        ).then(resolve);
      });
    });
  };

  const handleStep = (step: number): void => {
    switch (step) {
      case 2: {
        if (sendKey) {
          setState((prevState) => ({ ...prevState, step }));
        } else {
          setState((prevState) => ({ ...prevState, loading: true }));

          signAPI
            .getKeysignPayload(transaction, vault)
            .then((keysignPayload) => {
              signAPI
                .getSendKey(
                  keysignPayload,
                  vault.publicKeyEcdsa,
                  transaction.id
                )
                .then((sendKey) => {
                  setState((prevState) => ({
                    ...prevState,
                    loading: false,
                    sendKey,
                    step,
                  }));

                  handleStart(keysignPayload);
                })
                .catch(() => {
                  setState((prevState) => ({ ...prevState, loading: false }));
                });
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

      getStoredCurrency().then((currency) => {
        getStoredVaults().then((vautls) => {
          const vault = vautls.find(({ active }) => active);
          const [transaction] = vault?.transactions ?? [];

          if (transaction) {
            const chain = vault.chains.find(
              ({ name }) => name === transaction.chain
            );

            api
              .cryptoCurrency(chain.cmcId, currency)
              .then(({ data }) => {
                let price = 1;

                if (
                  data?.data &&
                  data.data[chain.cmcId]?.quote &&
                  data.data[chain.cmcId].quote[currency]?.price
                )
                  price = data.data[chain.cmcId].quote[currency].price;

                getWalletCore().then(({ core, chainRef }) => {
                  const signAPI = new SignAPI(
                    chain,
                    chainRef,
                    dataEncoder,
                    core
                  );

                  signAPI
                    .getEstimateTransactionFee()
                    .then((gasPrice) => {
                      setState((prevState) => ({
                        ...prevState,
                        chain,
                        currency,
                        gasPrice: parseInt(gasPrice) * 1e-9 * price,
                        signAPI,
                        transaction,
                        vault,
                      }));
                    })
                    .catch(() => {});
                });
              })
              .catch(() => {});
          }
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
                    <MiddleTruncate text={transaction.from} />
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TO)}</span>
                    <MiddleTruncate text={transaction.to} />
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.AMOUNT)}</span>
                    <span className="extra">{`${formatUnits(
                      transaction.value,
                      chain.decimals
                    )} ${chain.ticker}`}</span>
                  </div>
                  {transaction.data && (
                    <div className="list-item">
                      <span className="label">{t(messageKeys.MEMO)}</span>
                      <span className="extra">
                        {toUtf8String(transaction.data)}
                      </span>
                    </div>
                  )}
                  <div className="list-item">
                    <span className="label">Est. Network Fee</span>
                    <span className="extra">
                      {gasPrice.toValueFormat(currency)}
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
                <div className="qrcode">
                  <QRCodeBorder className="border" />
                  <QRCode size={312} value={sendKey} />
                </div>
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
              <div className="content">
                <div className="list">
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TRANSACTION)}</span>
                    <MiddleTruncate text={txHash} />
                    <div className="actions">
                      <a
                        href={`${explorerUrl[chain.name]}/tx/${txHash}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="btn"
                      >
                        <SquareArrow />
                        {t(messageKeys.VIEW_TX)}
                      </a>
                      <span className="btn" onClick={()=>handleCopy(txHash)}>
                        <SquareBehindSquare />
                        {t(messageKeys.COPY_TX)}
                      </span>
                    </div>
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TO)}</span>
                    <MiddleTruncate text={transaction.to} />
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.AMOUNT)}</span>
                    <span className="extra">{`${formatUnits(
                      transaction.value,
                      chain.decimals
                    )} ${chain.ticker}`}</span>
                  </div>
                  {transaction.data && (
                    <div className="list-item">
                      <span className="label">{t(messageKeys.MEMO)}</span>
                      <span className="extra">
                        {toUtf8String(transaction.data)}
                      </span>
                    </div>
                  )}
                  <div className="list-item">
                    <span className="label">Est. Network Fee</span>
                    <span className="extra">
                      {gasPrice.toValueFormat(currency)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="footer">
                <Button
                  onClick={handleClose}
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

      {contextHolder}
    </ConfigProvider>
  );
};

export default Component;

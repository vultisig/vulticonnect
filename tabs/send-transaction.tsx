import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, QRCode, message } from "antd";
import { formatUnits, toUtf8String } from "ethers";

import { errorKey, explorerUrl } from "~utils/constants";
import {
  getStoredCurrency,
  getStoredLanguage,
  getStoredTransactions,
  getStoredVaults,
  setStoredTransaction,
} from "~utils/storage";
import type {
  ParsedMemo,
  SignatureProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import i18n from "~i18n/config";
import api from "~utils/api";
import messageKeys from "~utils/message-keys";
import DataConverterProvider from "~utils/data-converter-provider";
import TransactionProvider from "~utils/transaction-provider";
import WalletCoreProvider from "~utils/wallet-core-provider";

import {
  ChevronLeft,
  QRCodeBorder,
  SquareArrow,
  SquareBehindSquare,
} from "~icons";
import ConfigProvider from "~components/config-provider";
import MiddleTruncate from "~components/middle-truncate";
import VultiLoading from "~components/vulti-loading";

import "~styles/index.scss";
import "~tabs/send-transaction.scss";
import "~utils/prototypes";
import VultiError from "~components/vulti-error";
import { parseMemo, splitString } from "~utils/functions";

interface InitialState {
  fastSign?: boolean;
  loaded?: boolean;
  loading?: boolean;
  sendKey?: string;
  step: number;
  transaction?: TransactionProps;
  txProvider?: TransactionProvider;
  parsedMemo?: ParsedMemo;
  vault?: VaultProps;
  hasError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const RETRY_TIMEOUT = 120000; //2min
  const CLOSE_TIMEOUT = 60000; //1min
  const initialState: InitialState = { step: 1, hasError: false };
  const [state, setState] = useState(initialState);
  const {
    fastSign,
    loaded,
    loading,
    sendKey,
    step,
    transaction,
    txProvider,
    vault,
    hasError,
    errorTitle,
    errorDescription,
    parsedMemo,
  } = state;
  const [messageApi, contextHolder] = message.useMessage();

  const handleApp = (): void => {
    window.open(sendKey, "_self");
  };

  const handleClose = (): void => {
    window.close();
  };

  const handleCopy = (): void => {
    navigator.clipboard
      .writeText(transaction.txHash)
      .then(() => {
        messageApi.open({
          type: "success",
          content: t(messageKeys.SUCCESSFUL_COPY_LINK),
        });
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: t(messageKeys.UNSUCCESSFUL_COPY_LINK),
        });
      });
  };

  const initCloseTimer = (timeout: number) => {
    setTimeout(() => {
      handleClose();
    }, timeout);
  };

  const handlePending = (preSignedImageHash: string): void => {
    const retryTimeout = setTimeout(() => {
      setStoredTransaction({ ...transaction, status: "error" }).then(() => {
        setState({
          ...state,
          hasError: true,
          errorTitle: t(messageKeys.TIMEOUT_ERROR),
          errorDescription: t(messageKeys.SIGNING_TIMEOUT_DESCRIPTION),
        });
        handleClose();
      });
    }, RETRY_TIMEOUT);

    const attemptTransaction = (): void => {
      api.transaction
        .getComplete(transaction.id, preSignedImageHash)
        .then((data) => {
          clearTimeout(retryTimeout);
          txProvider
            .getSignedTransaction(transaction, data as SignatureProps)
            .then((txHash) => {
              setStoredTransaction({
                ...transaction,
                status: "success",
                txHash,
              }).then(() => {
                setState((prevState) => ({
                  ...prevState,
                  step: 4,
                  transaction: { ...transaction, txHash },
                }));
                initCloseTimer(CLOSE_TIMEOUT);
              });
            })
            .catch(() => {});
        })
        .catch(({ status }) => {
          if (status === 404) {
            setTimeout(() => {
              attemptTransaction();
            }, 1000);
          } else {
            clearTimeout(retryTimeout);
            setStoredTransaction({ ...transaction, status: "error" }).then(
              () => {
                handleClose();
              }
            );
          }
        });
    };
    attemptTransaction();
  };

  const handleStart = (): void => {
    api.transaction
      .getDevices(transaction.id)
      .then(({ data }) => {
        if (data?.length > 1) {
          api.transaction.setStart(transaction.id, data).then(() => {
            setStoredTransaction({ ...transaction, status: "pending" }).then(
              () => {
                txProvider
                  .getPreSignedInputData()
                  .then((preSignedInputData) => {
                    txProvider
                      .getPreSignedImageHash(preSignedInputData)
                      .then((preSignedImageHash) => {
                        setState((prevState) => ({ ...prevState, step: 3 }));

                        handlePending(preSignedImageHash);
                      });
                  });
              }
            );
          });
        } else {
          setTimeout(() => {
            handleStart();
          }, 1000);
        }
      })
      .catch(() => {
        setStoredTransaction({ ...transaction, status: "error" }).then(() => {
          handleClose();
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

          txProvider
            .getKeysignPayload(transaction, vault)
            .then(() => {
              txProvider
                .getTransactionKey(vault.publicKeyEcdsa, transaction.id)
                .then((sendKey) => {
                  api.checkVaultExist(vault.publicKeyEcdsa).then((fastSign) => {
                    setState((prevState) => ({
                      ...prevState,
                      fastSign,
                      loading: false,
                      sendKey,
                      step,
                    }));

                    handleStart();
                  });
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
    Promise.all([
      getStoredCurrency(),
      getStoredLanguage(),
      getStoredTransactions(),
      getStoredVaults(),
    ]).then(([currency, language, transactions, vaults]) => {
      const [transaction] = transactions;

      i18n.changeLanguage(language);

      if (transaction) {
        const vault = vaults.find(
          ({ chains }) =>
            chains.findIndex(
              ({ address }) =>
                address.toLowerCase() === transaction.from.toLowerCase()
            ) >= 0
        );
        const walletCore = new WalletCoreProvider();
        walletCore
          .getCore()
          .then(({ chainRef, walletCore }) => {
            const dataConverter = new DataConverterProvider();
            const txProvider = new TransactionProvider(
              transaction.chain.name,
              chainRef,
              dataConverter.compactEncoder,
              walletCore
            );
            parseMemo(transaction.data)
              .then((memo) => {
                setState({ ...state, parsedMemo: memo });
              })
              .catch();
            txProvider.getFeeData().then(() => {
              txProvider
                .getEstimateTransactionFee(transaction.chain.cmcId, currency)
                .then((gasPrice) => {
                  transaction.gasPrice = gasPrice;
                  try {
                    transaction.memo = toUtf8String(transaction.data);
                  } catch (err) {
                    if (!parsedMemo) {
                      transaction.memo = transaction.data;
                    }
                  }
                  setStoredTransaction(transaction).then(() => {
                    setState((prevState) => ({
                      ...prevState,
                      currency,
                      loaded: true,
                      transaction,
                      txProvider,
                      vault,
                    }));
                  });
                });
            });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.error(errorKey.FAIL_TO_GET_TRANSACTION);
      }
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      {loaded && !hasError ? (
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
                  {transaction.value && (
                    <div className="list-item">
                      <span className="label">{t(messageKeys.AMOUNT)}</span>
                      <span className="extra">{`${formatUnits(
                        transaction.value,
                        transaction.chain.decimals
                      )} ${transaction.chain.ticker}`}</span>
                    </div>
                  )}
                  {transaction.memo && !parsedMemo && (
                    <div className="memo-item">
                      <span className="label">{t(messageKeys.MEMO)}</span>
                      <span className="extra">
                        <div>
                          {splitString(transaction.memo, 32).map(
                            (str, index) => (
                              <div key={index}>{str}</div>
                            )
                          )}
                        </div>
                      </span>
                    </div>
                  )}
                  <div className="list-item">
                    <span className="label">{t(messageKeys.NETWORK_FEE)}</span>
                    <span className="extra">{transaction.gasPrice}</span>
                  </div>
                  {parsedMemo && (
                    <>
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.FUNCTION_SIGNATURE)}
                        </span>
                        <div className="scrollable-x">
                          {parsedMemo.signature}
                        </div>
                      </div>
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.FUNCTION_INPUTS)}
                        </span>
                        <div className="scrollable-x monospace-text ">
                          <div style={{ width: "max-content" }}>
                            <div className="function-inputs">
                              {parsedMemo.inputs}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
                <span className="hint">
                  {t(messageKeys.SCAN_QR_WITH_DEVICE)}
                </span>
                <div className="qrcode">
                  <QRCodeBorder className="border" />
                  <div className="qr-container" >
                    <QRCode bordered size={275} value={sendKey} color="white" />
                  </div>
                </div>
              </div>
              <div className="footer">
                <Button type="primary" shape="round" disabled block>
                  {t(messageKeys.FAST_SIGN)}
                </Button>
                <Button onClick={handleApp} type="default" shape="round" block>
                  {t(messageKeys.OPEN_DESKTOP_APP)}
                </Button>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div className="content">
                <VultiLoading />
                <span className="message">{t(messageKeys.SIGNING)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="content">
                <div className="list">
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TRANSACTION)}</span>
                    <MiddleTruncate text={transaction.txHash} />
                    <div className="actions">
                      <a
                        href={`${explorerUrl[transaction.chain.name]}/tx/${
                          transaction.txHash
                        }`}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="btn"
                      >
                        <SquareArrow />
                        {t(messageKeys.VIEW_TX)}
                      </a>
                      <span className="btn" onClick={() => handleCopy()}>
                        <SquareBehindSquare />
                        {t(messageKeys.COPY_TX)}
                      </span>
                    </div>
                  </div>
                  <div className="list-item">
                    <span className="label">{t(messageKeys.TO)}</span>
                    <MiddleTruncate text={transaction.to} />
                  </div>
                  {transaction.value && (
                    <div className="list-item">
                      <span className="label">{t(messageKeys.AMOUNT)}</span>
                      <span className="extra">{`${formatUnits(
                        transaction.value,
                        transaction.chain.decimals
                      )} ${transaction.chain.ticker}`}</span>
                    </div>
                  )}

                  {transaction.memo && !parsedMemo && (
                    <div className="memo-item">
                      <span className="label">{t(messageKeys.MEMO)}</span>
                      <span className="extra">
                        <div>
                          {splitString(transaction.memo, 32).map(
                            (str, index) => (
                              <div key={index}>{str}</div>
                            )
                          )}
                        </div>
                      </span>
                    </div>
                  )}
                  <div className="list-item">
                    <span className="label">{t(messageKeys.NETWORK_FEE)}</span>
                    <span className="extra">{transaction.gasPrice}</span>
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
      ) : (
        <VultiLoading />
      )}
      {contextHolder}
      {loaded && hasError && (
        <VultiError title={t(errorTitle)} description={t(errorDescription)} />
      )}
    </ConfigProvider>
  );
};

export default Component;

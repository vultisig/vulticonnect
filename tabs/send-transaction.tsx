import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, ConfigProvider } from "antd";

import { ChainKey, themeConfig } from "~utils/constants";
import { hexToAscii } from "~utils/functions";
import {
  getStoredChains,
  getStoredLanguage,
  getStoredVaults,
} from "~utils/storage";
import type { ChainProps, TransactionProps } from "~utils/interfaces";
import i18n from "~i18n/config";
import messageKeys from "~utils/message-keys";

import "~styles/index.scss";
import "~tabs/send-transaction.scss";
import { EvmApi } from "~utils/evm/EvmApi";
import { formatUnits } from "ethers";
interface InitialState {
  chain?: ChainProps;
  transaction?: TransactionProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { chain, transaction } = state;
  const [gasPrice, setGasPrice] = useState("0.00");

  const handleConfirm = () => {};

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredChains().then((chains) => {
        getStoredVaults().then((vautls) => {
          const chain = chains.find(({ active }) => active);
          const vault = vautls.find(({ active }) => active);
          const [transaction] = vault.transactions;

          setState((prevState) => ({
            ...prevState,
            chain,
            transaction: {
              ...transaction,
              data: hexToAscii(transaction.data ?? ""),
              value: formatUnits(transaction.value, chain.decimals).toString(),
            },
          }));
        });
      });
    });
  };

  useEffect(componentDidMount, []);
  useEffect(() => {
    const fetchGasPrice = async (chain: ChainKey) => {
      const evmApi = new EvmApi(chain);
      setGasPrice(await evmApi.estimateTransactionFee());
    };
    if (chain) {
      fetchGasPrice(chain.chain);
    }
  }, [chain]);
  return (
    <ConfigProvider theme={themeConfig}>
      <div className="layout">
        <div className="header">
          <span className="heading">{t(messageKeys.VERIFY_SEND)}</span>
          <span className="progress" style={{ width: `${100 / 4}%` }} />
        </div>
        <div className="content">
          {chain && transaction && (
            <>
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
                  <span className="extra">{`${transaction.value} ${chain.ticker}`}</span>
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
            </>
          )}
        </div>
        <div className="footer">
          <Button onClick={handleConfirm} type="primary" shape="round" block>
            {t(messageKeys.SIGN)}
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;

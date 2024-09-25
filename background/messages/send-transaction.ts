import type { PlasmoMessaging } from "@plasmohq/messaging";

import { v4 as uuidv4 } from "uuid";

import {
  getStoredChains,
  getStoredVaults,
  setStoredVaults,
} from "~utils/storage";
import type { Messaging, TransactionProps } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.SendTransaction.Request,
  Messaging.SendTransaction.Response
> = async (req, res) => {
  getStoredChains().then((chains) => {
    getStoredVaults().then((vaults) => {
      const activeChain = chains.find(({ active }) => active);
      const activeVault = vaults.find(({ active }) => active);
      const transaction: TransactionProps = {
        ...req.body.transaction,
        chain: activeChain.name,
        decimals: activeChain.decimals,
        id: uuidv4(),
        status: "default",
        ticker: activeChain.ticker,
      };

      activeVault.transactions = [transaction, ...activeVault.transactions];

      setStoredVaults(
        vaults.map((vault) => (vault.active ? activeVault : vault))
      ).then(() => {
        let createdWindowId: number;

        chrome.windows.create(
          {
            url: chrome.runtime.getURL("tabs/send-transaction.html"),
            type: "popup",
            height: 639,
            left: req.body.screen.width - 376,
            top: 0,
            width: 376,
          },
          (window) => {
            createdWindowId = window.id;
          }
        );

        chrome.windows.onRemoved.addListener((closedWindowId) => {
          if (closedWindowId === createdWindowId) {
            getStoredVaults().then((vaults) => {
              setStoredVaults(
                vaults.map((vault) => ({
                  ...vault,
                  transactions: vault.transactions.filter(
                    ({ id, status }) =>
                      id !== transaction.id || status !== "default"
                  ),
                }))
              ).then(() => {
                res.send({ transactionHash: "0xMockTransactionHash" });
              });
            });
          }
        });
      });
    });
  });
};

export default handler;

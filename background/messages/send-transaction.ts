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
      const chain = chains.find(({ active }) => active);
      const vault = vaults.find(({ active }) => active);

      const prepareTransaction = (): Promise<TransactionProps> => {
        return new Promise((resolve, reject) => {
          resolve({
            ...req.body.transaction,
            chain,
            id: uuidv4(),
            status: "default",
          });
        });
      };
      prepareTransaction().then((transaction) => {
        vault.transactions = [transaction, ...vault.transactions];

        setStoredVaults(vaults.map((v) => (v.active ? vault : v))).then(() => {
          let createdWindowId: number;

          chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
            const height = 639;
            const width = 376;
            let left = 0;
            let top = 0;

            if (
              currentWindow &&
              currentWindow.left !== undefined &&
              currentWindow.top !== undefined &&
              currentWindow.width !== undefined
            ) {
              left = currentWindow.left + currentWindow.width - width;
              top = currentWindow.top;
            }

            chrome.windows.create(
              {
                url: chrome.runtime.getURL("tabs/send-transaction.html"),
                type: "popup",
                height,
                left,
                top,
                width,
              },
              (window) => {
                createdWindowId = window.id;
              }
            );
          });

          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredVaults().then((vaults) => {
                let transactionHash = "";

                setStoredVaults(
                  vaults.map((vault) => ({
                    ...vault,
                    transactions: vault.transactions.filter(
                      ({ id, status, txHash }) => {
                        if (id === transaction.id)
                          transactionHash = txHash ?? "";

                        return id !== transaction.id || status !== "default";
                      }
                    ),
                  }))
                ).then(() => {
                  res.send({ transactionHash });
                });
              });
            }
          });
        });
      });
    });
  });
};

export default handler;

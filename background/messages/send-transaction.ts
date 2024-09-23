import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.SendTransaction.Request,
  Messaging.SendTransaction.Response
> = async (req, res) => {
  getStoredVaults().then((vaults) => {
    setStoredVaults(
      vaults.map((vault) => ({
        ...vault,
        transactions: vault.active
          ? [req.body.transaction, ...vault.transactions]
          : vault.transactions,
      }))
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
                    id !== req.body.transaction.id || status !== "default"
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
};

export default handler;

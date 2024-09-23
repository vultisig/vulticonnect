import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getStoredAccounts, setStoredAccounts } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.GetAccounts.Request,
  Messaging.GetAccounts.Response
> = async (req, res) => {
  setStoredAccounts({
    addresses: [],
    chain: req.body.chain,
    sender: req.sender.origin,
  }).then(() => {
    let createdWindowId: number;

    chrome.windows.create(
      {
        url: chrome.runtime.getURL("tabs/get-accounts.html"),
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
        getStoredAccounts()
          .then((accounts) => {
            res.send({ accounts: accounts.addresses });
          })
          .catch(() => {
            res.send({ accounts: [] });
          });
      }
    });
  });
};

export default handler;

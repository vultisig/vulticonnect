import type { PlasmoMessaging } from "@plasmohq/messaging";

import { ChainKey } from "~utils/constants";
import { getStoredAccounts, setStoredAccounts } from "~utils/storage";

export type RequestBody = { chain: ChainKey };

const handler: PlasmoMessaging.MessageHandler<RequestBody> = async (
  req,
  res
) => {
  setStoredAccounts({
    addresses: [],
    chain: req.body.chain,
    favicon: req.sender.tab.favIconUrl,
    origin: req.sender.origin,
  }).then(() => {
    let createdWindowId: number;

    chrome.windows.create(
      {
        url: chrome.runtime.getURL("tabs/get-accounts.html"),
        type: "popup",
        width: 376,
        height: 600,
      },
      (window) => {
        createdWindowId = window.id;
      }
    );

    chrome.windows.onRemoved.addListener((closedWindowId) => {
      if (closedWindowId === createdWindowId) {
        getStoredAccounts()
          .then((accounts) => {
            res.send(accounts.addresses);
          })
          .catch(() => {
            res.send([]);
          });
      }
    });
  });
};

export default handler;

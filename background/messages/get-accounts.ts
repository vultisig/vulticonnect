import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getStoredVaults, setStoredRequest } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.GetAccounts.Request,
  Messaging.GetAccounts.Response
> = async (req, res) => {
  setStoredRequest({
    chain: req.body.chain,
    sender: req.sender.origin,
  }).then(() => {
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
          url: chrome.runtime.getURL("tabs/get-accounts.html"),
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
        getStoredVaults()
          .then((vaults) => {
            res.send({
              accounts: vaults.flatMap(({ apps, chains }) =>
                chains
                  .filter(
                    ({ name }) =>
                      name === req.body.chain &&
                      apps.indexOf(req.sender.origin) >= 0
                  )
                  .map(({ address }) => address)
              ),
            });
          })
          .catch(() => {
            res.send({ accounts: [] });
          });
      }
    });
  });
};

export default handler;

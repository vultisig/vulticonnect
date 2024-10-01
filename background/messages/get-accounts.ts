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

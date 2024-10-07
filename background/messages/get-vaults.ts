import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getStoredVaults } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.GetVaults.Request,
  Messaging.GetVaults.Response
> = async (req, res) => {
  let createdWindowId: number;

  chrome.windows.create(
    {
      url: chrome.runtime.getURL("tabs/get-vaults.html"),
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
        res.send({
          vaults: vaults
            .filter(({ selected }) => selected)
            .map(
              ({
                hexChainCode,
                name,
                publicKeyEcdsa,
                publicKeyEddsa,
                uid,
              }) => ({
                chains: [],
                hexChainCode,
                name,
                publicKeyEcdsa,
                publicKeyEddsa,
                transactions: [],
                uid,
              })
            ),
        });
      });
    }
  });
};

export default handler;

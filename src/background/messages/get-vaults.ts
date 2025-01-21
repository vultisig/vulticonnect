import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.GetVaults.Request,
  Messaging.GetVaults.Response
> = async (req, res) => {
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
    getStoredVaults().then((vaults) => {
      setStoredVaults(
        vaults.map((vault) => ({ ...vault, selected: false }))
      ).then(() => {
        chrome.windows.create(
          {
            url: chrome.runtime.getURL("tabs/get-vaults.html"),
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
    });
  });

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

import type { PlasmoMessaging } from "@plasmohq/messaging";

import { ChainKey } from "~utils/constants";
import { getStoredVaults } from "~utils/storage";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 360,
      height: 600,
    },
    (window) => {
      console.log(`Popup window created with ID ${window.id}`);
    }
  );

  getStoredVaults()
    .then((vaults) => {
      res.send(
        vaults.map(
          (vault) =>
            vault.chains.find(({ chain }) => chain === ChainKey.ETHEREUM)
              ?.address
        )
      );
    })
    .catch(() => {
      res.send([]);
    });
};

export default handler;

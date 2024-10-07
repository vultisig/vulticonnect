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
      if (!currentWindow) {
        console.error("Error: Unable to get the current window.");
        return;
      }
    
      // Get the current window's dimensions and position
      const { left: windowLeft, top: windowTop, width: windowWidth } = currentWindow;
    
      if (windowLeft === undefined || windowTop === undefined || windowWidth === undefined) {
        console.error("Error: Current window properties are undefined.");
        return;
      }
    
      // Set the popup position to the left of the current browser window
      const leftPosition = windowLeft + windowWidth - 376; // 376 is the popup width, adjust for the right side
      const topPosition = windowTop; // Top of the browser window
    
      chrome.windows.create(
        {
          url: chrome.runtime.getURL("tabs/get-accounts.html"),
          type: "popup",
          height: 639,
          width: 376,
          left: leftPosition,
          top: topPosition,
        },
        (window) => {
          if (chrome.runtime.lastError) {
            console.error("Error creating window: ", chrome.runtime.lastError);
          } else {
            createdWindowId = window.id;
          }
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

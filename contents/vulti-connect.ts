import type { PlasmoCSConfig } from "plasmo";
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import type { Messaging, VaultProps } from "~utils/interfaces";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

const vultiConnect = {
  getVaults: (): Promise<VaultProps[]> => {
    return new Promise((resolve) => {
      sendToBackgroundViaRelay<
        Messaging.GetVaults.Request,
        Messaging.GetVaults.Response
      >({ name: "get-vaults" }).then(({ vaults }) => {
        resolve(vaults);
      });
    });
  },
};

window.vultiConnect = vultiConnect;

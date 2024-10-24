import type { PlasmoCSConfig } from "plasmo";

import { sendToBackground } from "@plasmohq/messaging";
import { relay } from "@plasmohq/messaging/relay";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

relay(
  {
    name: "get-accounts" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "get-chains" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "get-vaults" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "send-transaction" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "set-chains" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "set-priority" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "eth-request" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

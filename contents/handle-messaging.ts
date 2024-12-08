import type { PlasmoCSConfig } from "plasmo";

import { sendToBackground } from "@plasmohq/messaging";
import { relay } from "@plasmohq/messaging/relay";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

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

relay(
  {
    name: "thor-request" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "maya-request" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "cosmos-request" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

relay(
  {
    name: "utxo-request" as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req);

    return openResult;
  }
);

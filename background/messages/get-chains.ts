import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Messaging } from "~utils/interfaces";

import { getStoredChains } from "~utils/storage";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.GetChains.Request,
  Messaging.GetChains.Response
> = async (req, res) => {
  getStoredChains().then((chains) => {
    res.send({ chains });
  });
};

export default handler;

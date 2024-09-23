import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Messaging } from "~utils/interfaces";

import { setStoredChains } from "~utils/storage";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.SetChains.Request,
  Messaging.SetChains.Response
> = async (req, res) => {
  setStoredChains(req.body.chains).then(() => {
    res.send(null);
  });
};

export default handler;

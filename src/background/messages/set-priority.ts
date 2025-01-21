import type { PlasmoMessaging } from "@plasmohq/messaging";

import { getIsPriority, setIsPriority } from "~utils/storage";
import type { Messaging } from "~utils/interfaces";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.SetPriority.Request,
  Messaging.SetPriority.Response
> = async (req, res) => {
  if (req.body) {
    setIsPriority(req.body.priority);
    res.send(req.body.priority);
  } else {
    res.send(await getIsPriority());
  }
};

export default handler;

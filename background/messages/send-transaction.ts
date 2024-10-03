import type { PlasmoMessaging } from "@plasmohq/messaging";

import { Contract, Interface, JsonRpcProvider } from "ethers";
import { v4 as uuidv4 } from "uuid";

import {
  getStoredChains,
  getStoredVaults,
  setStoredVaults,
} from "~utils/storage";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import ERC20Abi from "~utils/erc20";
import { rpcUrl } from "~utils/constants";

const handler: PlasmoMessaging.MessageHandler<
  Messaging.SendTransaction.Request,
  Messaging.SendTransaction.Response
> = async (req, res) => {
  getStoredChains().then((chains) => {
    getStoredVaults().then((vaults) => {
      const chain = chains.find(({ active }) => active);
      const vault = vaults.find(({ active }) => active);

      const prepareTransaction = (): Promise<TransactionProps> => {
        return new Promise((resolve, reject) => {
          if (
            req.body.transaction.data &&
            !parseInt(req.body.transaction.value)
          ) {
            const provider = new JsonRpcProvider(rpcUrl[chain.name]);
            const coinContract = new Contract(
              req.body.transaction.to,
              ERC20Abi,
              provider
            );
            const iface = new Interface(ERC20Abi);
            const data = iface.parseTransaction({
              data: req.body.transaction.data,
            });

            const [to, value] = data.args;

            Promise.all([coinContract.symbol(), coinContract.decimals()])
              .then(([ticker, decimals]) => {
                resolve({
                  data: "0x",
                  chain: { ...chain, decimals: Number(decimals), ticker },
                  contract: req.body.transaction.to,
                  from: req.body.transaction.from,
                  id: uuidv4(),
                  status: "default",
                  to,
                  value: `0x${value.toString(16)}`,
                });
              })
              .catch(reject);
          } else {
            resolve({
              ...req.body.transaction,
              chain,
              id: uuidv4(),
              status: "default",
            });
          }
        });
      };

      prepareTransaction().then((transaction) => {
        vault.transactions = [transaction, ...vault.transactions];

        setStoredVaults(vaults.map((v) => (v.active ? vault : v))).then(() => {
          let createdWindowId: number;

          chrome.windows.create(
            {
              url: chrome.runtime.getURL("tabs/send-transaction.html"),
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
                let transactionHash = "";

                setStoredVaults(
                  vaults.map((vault) => ({
                    ...vault,
                    transactions: vault.transactions.filter(
                      ({ id, status, txHash }) => {
                        if (id === transaction.id)
                          transactionHash = txHash ?? "";

                        return id !== transaction.id || status !== "default";
                      }
                    ),
                  }))
                ).then(() => {
                  res.send({ transactionHash });
                });
              });
            }
          });
        });
      });
    });
  });
};

export default handler;

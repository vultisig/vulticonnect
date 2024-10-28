import type { MessagesMetadata, PlasmoMessaging } from "@plasmohq/messaging";
import { JsonRpcProvider, type TransactionRequest } from "ethers";
import {
  ChainKey,
  chains,
  EVMRequestMethod,
  rpcUrl,
  ThorRequestMethod,
} from "~utils/constants";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import { v4 as uuidv4 } from "uuid";
import {
  getStoredChains,
  getStoredTransactions,
  getStoredVaults,
  setStoredChains,
  setStoredRequest,
  setStoredTransactions,
  setStoredVaults,
} from "~utils/storage";
import axios from "axios";
import { isSupportedChain } from "~utils/functions";

let rpcProvider: JsonRpcProvider;

const initializeProvider = (chainKey: string) => {
  const rpc = rpcUrl[chainKey];
  rpcProvider = new JsonRpcProvider(rpc);
};

const updateProvider = (chainKey: string) => {
  if (rpcProvider) {
    const rpc = rpcUrl[chainKey];
    rpcProvider = new JsonRpcProvider(rpc);
  }
};

const getAccounts = (
  chain: ChainKey,
  sender: string
): Promise<{ accounts: string[] }> => {
  return new Promise((resolve) => {
    setStoredRequest({
      chain,
      sender,
    }).then(() => {
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

        chrome.windows.create(
          {
            url: chrome.runtime.getURL("tabs/get-accounts.html"),
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

      chrome.windows.onRemoved.addListener((closedWindowId) => {
        if (closedWindowId === createdWindowId) {
          getStoredVaults()
            .then((vaults) => {
              resolve({
                accounts: vaults.flatMap(({ apps, chains }) =>
                  chains
                    .filter(
                      ({ name }) => name === chain && apps.indexOf(sender) >= 0
                    )
                    .map(({ address }) => address)
                ),
              });
            })
            .catch(() => {
              resolve({ accounts: [] });
            });
        }
      });
    });
  });
};

const sendTransaction = (
  transaction: TransactionProps,
  activeChain: string
): Promise<{
  transactionHash: string;
}> => {
  return new Promise((resolve, reject) => {
    getStoredChains().then((chains) => {
      getStoredTransactions().then((transactions) => {
        const chain = chains.find((chain) => chain.id === activeChain);
        const uuid = uuidv4();
        setStoredTransactions([
          {
            ...transaction,
            chain,
            id: uuid,
            status: "default",
          },
          ...transactions,
        ]).then(() => {
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

            chrome.windows.create(
              {
                url: chrome.runtime.getURL("tabs/send-transaction.html"),
                type: "popup",
                height,
                left,
                top,
                width,
              },
              (window) => {
                createdWindowId = window.id;
                getStoredTransactions().then((transactions) => {
                  setStoredTransactions(
                    transactions.map((transaction) =>
                      transaction.id === uuid
                        ? { ...transaction, windowId: createdWindowId }
                        : transaction
                    )
                  );
                });
              }
            );
          });

          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredTransactions().then((transactions) => {
                const transaction = transactions.find(
                  ({ windowId }) => windowId === createdWindowId
                );
                if (transaction?.status !== "default") {
                  getStoredVaults().then((vaults) => {
                    setStoredVaults(
                      vaults.map((vault) => ({
                        ...vault,
                        transactions: [transaction, ...vault.transactions],
                      }))
                    ).then(() => {
                      resolve({ transactionHash: transaction.txHash });
                    });
                  });
                } else {
                  reject();
                }
              });
            }
          });
        });
      });
    });
  });
};

const handleRequest = (
  req: PlasmoMessaging.Request<
    keyof MessagesMetadata,
    Messaging.EthRequest.Request
  >
): Promise<Messaging.EthRequest.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = req.body;
    console.log(req.body);

    switch (method) {
      case ThorRequestMethod.REQUEST_ACCOUNTS: {
        getAccounts(ChainKey.THORCHAIN, req.sender.origin).then(
          ({ accounts }) => {
            resolve(accounts[0]);
          }
        );
        break;
      }
      default: {
        // _emit(EventMethod.ERROR, new Error(`Unsupported method: ${method}`));
        reject(`Unsupported method: ${method}`);

        break;
      }
    }
  });
};

const handler: PlasmoMessaging.MessageHandler<
  Messaging.EthRequest.Request,
  Messaging.EthRequest.Response
> = async (req, res) => {
  handleRequest(req).then((result) => {
    res.send(result);
  });
};

export default handler;

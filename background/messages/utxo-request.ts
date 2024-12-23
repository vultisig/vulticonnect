import type { MessagesMetadata, PlasmoMessaging } from "@plasmohq/messaging";
import { JsonRpcProvider } from "ethers";
import { ChainKey, chains, RequestMethod, rpcUrl } from "~utils/constants";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import { v4 as uuidv4 } from "uuid";
import {
  getStoredTransactions,
  getStoredVaults,
  setStoredRequest,
  setStoredTransactions,
  setStoredVaults,
} from "~utils/storage";
import api from "~utils/api";
import { calculateWindowPosition } from "~utils/functions";

let rpcProvider: JsonRpcProvider;

const initializeProvider = (chainKey: string) => {
  const rpc = rpcUrl[chainKey];
  rpcProvider = new JsonRpcProvider(rpc);
};

const getAccounts = (
  chain: ChainKey,
  sender: string
): Promise<{ accounts: string[] }> => {
  return new Promise((resolve, reject) => {
    setStoredRequest({
      chain,
      sender,
    }).then(() => {
      let createdWindowId: number;

      chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        const { height, left, top, width } =
          calculateWindowPosition(currentWindow);
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
              const accounts = vaults.flatMap(({ apps, chains }) =>
                chains
                  .filter(
                    ({ name }) => name === chain && apps.indexOf(sender) >= 0
                  )
                  .map(({ address }) => address)
              );
              if (accounts && accounts.length) {
                resolve({
                  accounts: accounts,
                });
              } else {
                reject({ accounts: [] });
              }
            })
            .catch(() => {
              reject({ accounts: [] });
            });
        }
      });
    });
  });
};

const sendTransaction = (
  transaction: TransactionProps,
  activeChain: string,
  isDeposit?: boolean
): Promise<{
  transactionHash: string;
}> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then((transactions) => {
      const chain = chains.find((chain) => chain.id == activeChain);
      const uuid = uuidv4();
      setStoredTransactions([
        {
          ...transaction,
          isDeposit,
          chain,
          id: uuid,
          status: "default",
        },
        ...transactions,
      ]).then(() => {
        let createdWindowId: number;

        chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
          const { height, left, top, width } =
            calculateWindowPosition(currentWindow);
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
};

const handleRequest = (
  req: PlasmoMessaging.Request<
    keyof MessagesMetadata,
    Messaging.UTXORequest.Request
  >
): Promise<Messaging.UTXORequest.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params, chainKey } = req.body;
    const UTXOChain = chains.find((chain) => chain.name == chainKey);
    initializeProvider(UTXOChain.name);
    switch (method) {
      case RequestMethod.GET_ACCOUNTS: {
        getStoredVaults().then((vaults) => {
          resolve(
            vaults.flatMap(({ apps, chains }) =>
              chains
                .filter(
                  ({ name }) =>
                    name === UTXOChain.name &&
                    apps.indexOf(req.sender.origin) >= 0
                )
                .map(({ address }) => address)
            )
          );
        });

        break;
      }
      case RequestMethod.REQUEST_ACCOUNTS: {
        getAccounts(UTXOChain.name, req.sender.origin)
          .then(({ accounts }) => {
            resolve(accounts[0]);
          })
          .catch(reject);
        break;
      }
      case RequestMethod.SEND_TRANSACTION: {
        const [transaction] = params as TransactionProps[];
        if (transaction) {
          sendTransaction(transaction, UTXOChain.id)
            .then(({ transactionHash }) => {
              resolve(transactionHash);
            })
            .catch(reject);
        } else {
          reject();
        }
        break;
      }
      case RequestMethod.GET_TRANSACTION_BY_HASH: {
        const [hash] = params;
        api.utxo.blockchairGetTx(chainKey, hash).then(resolve).catch(reject);
        break;
      }
      default: {
        reject(`Unsupported method: ${method}`);

        break;
      }
    }
  });
};

const handler: PlasmoMessaging.MessageHandler<
  Messaging.UTXORequest.Request,
  Messaging.UTXORequest.Response
> = async (req, res) => {
  handleRequest(req).then((result) => {
    res.send(result);
  });
};

export default handler;

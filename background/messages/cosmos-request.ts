import type { MessagesMetadata, PlasmoMessaging } from "@plasmohq/messaging";
import {
  ChainKey,
  chains,
  CosmosChain,
  RequestMethod,
  rpcUrl,
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
import { isSupportedChain } from "~utils/functions";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
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
  activeChain: string
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
};

const handleRequest = (
  req: PlasmoMessaging.Request<
    keyof MessagesMetadata,
    Messaging.CosmosRequest.Request
  >
): Promise<Messaging.CosmosRequest.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = req.body;
    getStoredChains().then((storedChains) => {
      // Cosmos Active Chain
      let activeChain = storedChains.find(
        (chain) =>
          (Object.values(CosmosChain) as unknown as ChainKey[]).includes(
            chain.name
          ) && chain.active === true
      );
      if (!activeChain) {
        activeChain = chains.find((chain) => chain.name == ChainKey.GAIACHAIN);
        handleRequest({
          ...req,
          body: {
            method: "wallet_add_chain",
            params: [{ chainId: "cosmoshub-4" }],
          },
        });
      }

      switch (method) {
        case RequestMethod.GET_ACCOUNTS: {
          getStoredVaults().then((vaults) => {
            resolve(
              vaults.flatMap(({ apps, chains }) =>
                chains
                  .filter(
                    ({ name }) =>
                      name === activeChain.name &&
                      apps.indexOf(req.sender.origin) >= 0
                  )
                  .map(({ address }) => address)
              )
            );
          });

          break;
        }
        case RequestMethod.REQUEST_ACCOUNTS: {
          getAccounts(activeChain.name, req.sender.origin)
            .then(({ accounts }) => {
              resolve(accounts[0]);
            })
            .catch(reject);
          break;
        }
        case RequestMethod.SEND_TRANSACTION: {
          const [transaction] = params as TransactionProps[];
          if (transaction) {
            sendTransaction(transaction, activeChain.id)
              .then(({ transactionHash }) => {
                resolve(transactionHash);
              })
              .catch(reject);
          } else {
            reject();
          }
          break;
        }
        case RequestMethod.CHAIN_ID: {
          resolve(activeChain.id);
          break;
        }
        case RequestMethod.WALLET_ADD_CHAIN: {
          const [param] = params;

          if (param?.chainId) {
            const supportedChain = chains.find(
              ({ id }) => id === param.chainId
            );

            if (supportedChain) {
              setStoredChains([
                { ...supportedChain, active: true },
                ...storedChains
                  .filter(({ name }) => name !== supportedChain.name)
                  .map((chain) => ({
                    ...chain,
                    active: false,
                  })),
              ])
                .then(() => resolve(null))
                .catch(reject);
            } else {
              reject(); // unsuported chain
            }
          } else {
            reject(); // chainId is required
          }

          break;
        }
        case RequestMethod.WALLET_SWITCH_CHAIN: {
          const [param] = params;
          if (param?.chainId) {
            if (!isSupportedChain(param?.chainId)) {
              reject("Chain not Supported");
            } else {
              const existed =
                storedChains.findIndex(({ id }) => id === param.chainId) >= 0;
              if (existed) {
                setStoredChains(
                  storedChains.map((chain) => ({
                    ...chain,
                    active: chain.id === param.chainId,
                  }))
                )
                  .then(() => resolve(param.chainId))
                  .catch(reject);
              } else {
                handleRequest({
                  ...req,
                  body: {
                    method: RequestMethod.WALLET_ADD_CHAIN,
                    params,
                  },
                })
                  .then(() => resolve(param.chainId))
                  .catch(reject);
              }
            }
          } else {
            reject(); // chainId is required
          }
          break;
        }
        case RequestMethod.GET_TRANSACTION_BY_HASH: {
          const [hash] = params;
          Tendermint34Client.connect(rpcUrl[activeChain.name])
            .then((client) => {
              client
                .tx(hash)
                .then((resp) => resolve(JSON.stringify(resp.result)))
                .catch(reject);
            })
            .catch((err) => {
              reject(`Could not initialize Tendermint Client: ${err}`);
            });
          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    });
  });
};

const handler: PlasmoMessaging.MessageHandler<
  Messaging.CosmosRequest.Request,
  Messaging.CosmosRequest.Response
> = async (req, res) => {
  handleRequest(req).then((result) => {
    res.send(result);
  });
};

export default handler;

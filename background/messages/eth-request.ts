import type { MessagesMetadata, PlasmoMessaging } from "@plasmohq/messaging";
import { JsonRpcProvider, type TransactionRequest } from "ethers";
import { ChainKey, chains, RequestMethod, rpcUrl } from "~utils/constants";
import type { Messaging, TransactionProps } from "~utils/interfaces";
import { v4 as uuidv4 } from "uuid";
import {
  getStoredChains,
  getStoredEthProviderState,
  getStoredTransactions,
  getStoredVaults,
  setStoredChains,
  setStoredEthProviderState,
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
    getStoredChains().then((chains) => {
      const activeChain = chains.find(({ active }) => active);
      initializeProvider(activeChain.name);
      switch (method) {
        case RequestMethod.ETH_ACCOUNTS: {
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
        case RequestMethod.ETH_CHAIN_ID: {
          resolve(activeChain.id);
          updateProvider(activeChain.name);

          break;
        }
        case RequestMethod.ETH_REQUEST_ACCOUNTS: {
          getAccounts(activeChain.name, req.sender.origin).then(
            ({ accounts }) => {
              resolve(accounts);
            }
          );
          break;
        }
        case RequestMethod.ETH_SEND_TRANSACTION: {
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
        case RequestMethod.ETH_GET_TRANSACTION_BY_HASH: {
          const [hash] = params;
          axios
            .post(rpcUrl[activeChain.name], {
              id: 1,
              jsonrpc: "2.0",
              method: "eth_getTransactionByHash",
              params: [hash],
            })
            .then((res) => {
              resolve(res.data.result);
            });
          break;
        }
        case RequestMethod.ETH_BLOCK_NUMBER: {
          rpcProvider.getBlock("latest").then((block) => {
            resolve(String(block.number));
          });
          break;
        }
        case RequestMethod.WALLET_ADD_ETHEREUM_CHAIN: {
          const [param] = params;

          if (param?.chainId) {
            const supportedChain = chains.find(
              ({ id }) => id === param.chainId
            );

            if (supportedChain) {
              setStoredChains([
                { ...supportedChain, active: true },
                ...chains
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
        case RequestMethod.WALLET_GET_PERMISSIONS: {
          resolve([]);

          break;
        }
        case RequestMethod.WALLET_REQUEST_PERMISSIONS: {
          resolve([]);

          break;
        }
        case RequestMethod.WALLET_REVOKE_PERMISSIONS: {
          getStoredVaults().then((vaults) => {
            setStoredVaults(
              vaults.map((vault) => ({
                ...vault,
                apps: vault.apps.filter((app) => app !== req.sender.origin),
              }))
            ).then(() => resolve(null));
          });
          break;
        }
        case RequestMethod.ETH_ESTIMATE_GAS: {
          const tx = { ...params[0] } as TransactionRequest;
          rpcProvider
            .estimateGas(tx)
            .then((res) => {
              resolve(res.toString());
            })
            .catch(reject);
          break;
        }
        case RequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
          const [param] = params;
          if (param?.chainId) {
            if (!isSupportedChain(param?.chainId)) {
              reject("Chain not Supported");
              // _emit(
              //   EventMethod.ERROR,
              //   new Error(`Unsupported chain: ${param?.chainId}`)
              // );
            } else {
              const existed =
                chains.findIndex(({ id }) => id === param.chainId) >= 0;
              if (existed) {
                setStoredChains(
                  chains.map((chain) => ({
                    ...chain,
                    active: chain.id === param.chainId,
                  }))
                )
                  .then(() => resolve(null))
                  .catch(reject);
              } else {
                handleRequest({
                  ...req,
                  body: {
                    method: RequestMethod.WALLET_ADD_ETHEREUM_CHAIN,
                    params,
                  },
                })
                  .then(resolve)
                  .catch(reject);
              }
            }
          } else {
            reject(); // chainId is required
          }
          break;
        }
        case RequestMethod.ETH_GET_BALANCE: {
          const [address, tag] = params;
          rpcProvider
            .getBalance(String(address), String(tag))
            .then((value) => {
              resolve(value.toString());
            })
            .catch(reject);
          break;
        }
        case RequestMethod.ETH_GET_BLOCK_BY_NUMBER: {
          const [tag, refresh] = params;
          rpcProvider
            .getBlock(String(tag), Boolean(refresh))
            .then((res) => {
              resolve(res.toJSON());
            })
            .catch(reject);
          break;
        }
        case RequestMethod.ETH_GAS_PRICE: {
          rpcProvider
            .getFeeData()
            .then((res) => {
              resolve(res.gasPrice.toString());
            })
            .catch(reject);
          break;
        }
        case RequestMethod.ETH_MAX_PRIORITY_FEE_PER_GAS: {
          rpcProvider
            .getFeeData()
            .then((res) => {
              resolve(res.maxPriorityFeePerGas.toString());
            })
            .catch(reject);
          break;
        }
        case RequestMethod.ETH_CALL: {
          const [tx, tag] = params;

          resolve(rpcProvider.call(tx));
        }
        case RequestMethod.ETH_GET_TRANSACTION_RECEIPT: {
          const [param] = params;
          rpcProvider
            .getTransactionReceipt(String(param))
            .then((receipt) => {
              resolve(receipt.toJSON());
            })
            .catch(reject);
          break;
        }
        default: {
          // _emit(EventMethod.ERROR, new Error(`Unsupported method: ${method}`));
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    });
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

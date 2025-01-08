import type { MessagesMetadata, PlasmoMessaging } from "@plasmohq/messaging";
import { JsonRpcProvider, type TransactionRequest } from "ethers";
import {
  ChainKey,
  chains,
  EVMChain,
  EVMRequestMethod,
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
                      if (transaction.isCustomMessage) {
                        resolve({
                          transactionHash: transaction.customSignature,
                        });
                      } else {
                        resolve({ transactionHash: transaction.txHash });
                      }
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
    getStoredChains().then((storedChains) => {
      let activeChain = storedChains.find(
        (chain) =>
          (Object.values(EVMChain) as unknown as ChainKey[]).includes(
            chain.name
          ) && chain.active === true
      );
      if (!activeChain) {
        activeChain = chains.find((chain) => chain.name == ChainKey.ETHEREUM);
        handleRequest({
          ...req,
          body: {
            method: EVMRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
            params: [{ chainId: "0x1" }],
          },
        });
      }

      initializeProvider(activeChain.name);
      switch (method) {
        case EVMRequestMethod.ETH_ACCOUNTS: {
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
        case EVMRequestMethod.ETH_CHAIN_ID: {
          resolve(activeChain.id);
          updateProvider(activeChain.name);

          break;
        }
        case EVMRequestMethod.ETH_REQUEST_ACCOUNTS: {
          getAccounts(activeChain.name, req.sender.origin)
            .then(({ accounts }) => {
              resolve(accounts);
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.ETH_SEND_TRANSACTION: {
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
        case EVMRequestMethod.ETH_GET_TRANSACTION_BY_HASH: {
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
        case EVMRequestMethod.ETH_BLOCK_NUMBER: {
          rpcProvider.getBlock("latest").then((block) => {
            resolve(String(block.number));
          });
          break;
        }
        case EVMRequestMethod.WALLET_ADD_ETHEREUM_CHAIN: {
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
        case EVMRequestMethod.WALLET_GET_PERMISSIONS: {
          resolve([]);

          break;
        }
        case EVMRequestMethod.WALLET_REQUEST_PERMISSIONS: {
          resolve([]);

          break;
        }
        case EVMRequestMethod.WALLET_REVOKE_PERMISSIONS: {
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
        case EVMRequestMethod.ETH_ESTIMATE_GAS: {
          const tx = { ...params[0] } as TransactionRequest;
          rpcProvider
            .estimateGas(tx)
            .then((res) => {
              resolve(res.toString());
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
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
                    method: EVMRequestMethod.WALLET_ADD_ETHEREUM_CHAIN,
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
        case EVMRequestMethod.ETH_GET_BALANCE: {
          const [address, tag] = params;
          rpcProvider
            .getBalance(String(address), String(tag))
            .then((value) => {
              resolve(value.toString());
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.ETH_GET_BLOCK_BY_NUMBER: {
          const [tag, refresh] = params;
          rpcProvider
            .getBlock(String(tag), Boolean(refresh))
            .then((res) => {
              resolve(res.toJSON());
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.ETH_GAS_PRICE: {
          rpcProvider
            .getFeeData()
            .then((res) => {
              resolve(res.gasPrice.toString());
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.ETH_MAX_PRIORITY_FEE_PER_GAS: {
          rpcProvider
            .getFeeData()
            .then((res) => {
              resolve(res.maxPriorityFeePerGas.toString());
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.ETH_CALL: {
          const [tx, tag] = params;

          resolve(rpcProvider.call(tx));
        }
        case EVMRequestMethod.ETH_GET_TRANSACTION_RECEIPT: {
          const [param] = params;

          rpcProvider
            .getTransactionReceipt(String(param))
            .then((receipt) => {
              if (receipt) resolve(receipt.toJSON());
              else reject();
            })
            .catch(reject);
          break;
        }
        case EVMRequestMethod.PERSONAL_SIGN: {
          const [message, address] = params;
          sendTransaction(
            {
              customMessage: {
                address: String(address),
                message: String(message),
              },
              isCustomMessage: true,
              chain: activeChain,
              data: "",
              from: String(address),
              id: "",
              status: "default",
              to: "",
              isDeposit: false,
            },
            activeChain.id
          )
            .then(({ transactionHash }) => {
              resolve(transactionHash);
            })
            .catch(reject);

          break;
        }
        case EVMRequestMethod.ETH_GET_CODE: {
          const [address, tag] = params;
          rpcProvider
            .getCode(String(address), String(tag))
            .then((res) => {
              resolve(res);
            })
            .catch(reject);
          break;
        }
        case "net_version": {
          resolve("1");
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

import { v4 as uuidv4 } from "uuid";
import { JsonRpcProvider, TransactionRequest } from "ethers";

import {
  ChainKey,
  CosmosChain,
  MessageKey,
  RequestMethod,
  chains,
  rpcUrl,
} from "utils/constants";
import { isSupportedChain } from "utils/functions";
import { ChainProps, ITransaction, Messaging } from "utils/interfaces";
import {
  getStoredChains,
  getStoredTransactions,
  getStoredVaults,
  setStoredChains,
  setStoredRequest,
  setStoredTransactions,
  setStoredVaults,
} from "utils/storage";
import api from "utils/api";

let rpcProvider: JsonRpcProvider;

const handleProvider = (chain: ChainKey, update?: boolean) => {
  const rpc = rpcUrl[chain];

  if (update) {
    if (rpcProvider) rpcProvider = new JsonRpcProvider(rpc);
  } else {
    rpcProvider = new JsonRpcProvider(rpc);
  }
};

const handleOpenPanel = (name: string): Promise<number> => {
  return new Promise((resolve) => {
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
          url: chrome.runtime.getURL(`${name}.html`),
          type: "panel",
          height,
          left,
          top,
          width,
        },
        (window) => {
          resolve(window?.id ?? 0);
        }
      );
    });
  });
};

const handleGetAccounts = (
  chain: ChainKey,
  sender: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    setStoredRequest({
      chain,
      sender,
    }).then(() => {
      handleOpenPanel("accounts").then((createdWindowId) => {
        chrome.windows.onRemoved.addListener((closedWindowId) => {
          if (closedWindowId === createdWindowId) {
            getStoredVaults()
              .then((vaults) => {
                resolve(
                  vaults.flatMap(({ apps, chains }) =>
                    apps
                      ? chains
                          .filter(
                            ({ name }) =>
                              name === chain && apps.indexOf(sender) >= 0
                          )
                          .map(({ address }) => address ?? "")
                      : []
                  )
                );
              })
              .catch(() => {
                resolve([]);
              });
          }
        });
      });
    });
  });
};

const handleGetVaults = (): Promise<Messaging.GetVaults.Response> => {
  return new Promise((resolve) => {
    getStoredVaults().then((vaults) => {
      setStoredVaults(
        vaults.map((vault) => ({ ...vault, selected: false }))
      ).then(() => {
        handleOpenPanel("vaults").then((createdWindowId) => {
          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredVaults().then((vaults) => {
                resolve(
                  vaults
                    .filter(({ selected }) => selected)
                    .map(
                      ({
                        hexChainCode,
                        name,
                        publicKeyEcdsa,
                        publicKeyEddsa,
                        uid,
                      }) => ({
                        chains: [],
                        hexChainCode,
                        name,
                        publicKeyEcdsa,
                        publicKeyEddsa,
                        transactions: [],
                        uid,
                      })
                    )
                );
              });
            }
          });
        });
      });
    });
  });
};

const handleSendTransaction = (
  transaction: ITransaction.METAMASK,
  chain: ChainProps
): Promise<string> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then((transactions) => {
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
        handleOpenPanel("transaction").then((createdWindowId) => {
          getStoredTransactions().then((transactions) => {
            setStoredTransactions(
              transactions.map((transaction) =>
                transaction.id === uuid
                  ? { ...transaction, windowId: createdWindowId }
                  : transaction
              )
            );
          });

          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredTransactions().then((transactions) => {
                const transaction = transactions.find(
                  ({ windowId }) => windowId === createdWindowId
                );

                if (transaction) {
                  if (transaction.status === "default") {
                    getStoredTransactions().then((transactions) => {
                      setStoredTransactions(
                        transactions.filter(
                          (transaction) =>
                            transaction.id !== uuid &&
                            transaction.windowId !== createdWindowId
                        )
                      ).then(reject);
                    });
                  } else {
                    getStoredVaults().then((vaults) => {
                      setStoredVaults(
                        vaults.map((vault) => ({
                          ...vault,
                          transactions: [transaction, ...vault.transactions],
                        }))
                      ).then(() => {
                        resolve(transaction.txHash ?? "");
                      });
                    });
                  }
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

const handleBitcoinRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.BITCOIN);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.BITCOIN, sender.origin).then((accounts) =>
            resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleBitcoinCashRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.BITCOINCASH);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.BITCOINCASH, sender.origin).then(
            (accounts) => resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleCosmosRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;

    getStoredChains().then((storedChains) => {
      let activeChain = storedChains.find(
        (chain) =>
          (Object.values(CosmosChain) as unknown as ChainKey[]).includes(
            chain.name
          ) && chain.active === true
      );

      if (!activeChain) {
        activeChain = chains.find((chain) => chain.name == ChainKey.GAIACHAIN);

        handleCosmosRequest(
          {
            method: "wallet_add_chain",
            params: [{ chainId: "cosmoshub-4" }],
          },
          sender
        );
      }

      if (activeChain) {
        switch (method) {
          case RequestMethod.VULTISIG.GET_ACCOUNTS: {
            getStoredVaults().then((vaults) => {
              resolve(
                vaults.flatMap(({ apps, chains }) =>
                  apps && sender.origin
                    ? chains
                        .filter(
                          ({ name }) =>
                            name === activeChain.name &&
                            apps?.indexOf(sender.origin ?? "") >= 0
                        )
                        .map(({ address }) => address ?? "")
                    : []
                )
              );
            });

            break;
          }
          case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
            if (sender.origin) {
              handleGetAccounts(activeChain.name, sender.origin).then(
                ([account]) => resolve(account)
              );
            }

            break;
          }
          case RequestMethod.VULTISIG.SEND_TRANSACTION: {
            const [transaction] = params as ITransaction.METAMASK[];

            if (transaction) {
              handleSendTransaction(transaction, activeChain)
                .then(resolve)
                .catch(reject);
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.VULTISIG.CHAIN_ID: {
            resolve(activeChain.id);

            break;
          }
          case RequestMethod.VULTISIG.WALLET_ADD_CHAIN: {
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
                  .then(() => resolve(""))
                  .catch(reject);
              } else {
                reject(); // unsuported chain
              }
            } else {
              reject(); // chainId is required
            }

            break;
          }
          case RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN: {
            const [param] = params;
            if (param?.chainId) {
              if (isSupportedChain(param?.chainId)) {
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
                  handleCosmosRequest(
                    {
                      method: RequestMethod.VULTISIG.WALLET_ADD_CHAIN,
                      params,
                    },
                    sender
                  )
                    .then(() => resolve(param.chainId))
                    .catch(reject);
                }
              } else {
                reject("Chain not Supported");
              }
            } else {
              reject(); // chainId is required
            }
            break;
          }
          default: {
            reject(`Unsupported method: ${method}`);

            break;
          }
        }
      }
    });
  });
};

const handleDogecoinCashRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.DOGECOIN);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.DOGECOIN, sender.origin).then((accounts) =>
            resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleEthereumRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;

    getStoredChains().then((storedChains) => {
      const chain = storedChains.find(({ active }) => active);

      if (chain && sender.origin) {
        handleProvider(chain.name);

        switch (method) {
          case RequestMethod.METAMASK.ETH_ACCOUNTS: {
            getStoredVaults().then((vaults) => {
              resolve(
                vaults.flatMap(({ apps, chains }) =>
                  apps
                    ? chains
                        .filter(
                          ({ name }) =>
                            name === chain.name &&
                            apps.indexOf(sender.origin ?? "") >= 0
                        )
                        .map(({ address }) => address ?? "")
                    : []
                )
              );
            });

            break;
          }
          case RequestMethod.METAMASK.ETH_CHAIN_ID: {
            handleProvider(chain.name, true);

            resolve(chain.id);

            break;
          }
          case RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS: {
            handleGetAccounts(chain.name, sender.origin).then((accounts) =>
              resolve(accounts)
            );
            break;
          }
          case RequestMethod.METAMASK.ETH_SEND_TRANSACTION: {
            const [transaction] = params as ITransaction.METAMASK[];

            if (transaction) {
              handleSendTransaction(transaction, chain)
                .then(resolve)
                .catch(reject);
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_TRANSACTION_BY_HASH: {
            const [hash] = params ?? [];
            const path = rpcUrl[chain.name];

            if (path && typeof hash === "string")
              api.getTransactionByHash(path, hash).then(resolve);

            break;
          }
          case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
            rpcProvider
              .getBlock("latest")
              .then((block) => resolve(String(block?.number)));

            break;
          }
          case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN: {
            const [param] = params ?? [];

            if (param?.chainId) {
              const supportedChain = chains.find(
                ({ id }) => id === param.chainId
              );

              if (supportedChain) {
                setStoredChains([
                  { ...supportedChain, active: true },
                  ...storedChains
                    .filter(({ name }) => name !== supportedChain.name)
                    .map((chain) => ({ ...chain, active: false })),
                ])
                  .then(() => resolve(supportedChain.id))
                  .catch(reject);
              } else {
                reject(); // unsuported chain
              }
            } else {
              reject(); // chainId is required
            }

            break;
          }
          case RequestMethod.METAMASK.WALLET_GET_PERMISSIONS: {
            resolve([]);

            break;
          }
          case RequestMethod.METAMASK.WALLET_REQUEST_PERMISSIONS: {
            resolve([]);

            break;
          }
          case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
            getStoredVaults().then((vaults) => {
              setStoredVaults(
                vaults.map((vault) => ({
                  ...vault,
                  apps: vault.apps?.filter((app) => app !== sender.origin),
                }))
              ).then(() => resolve(""));
            });
            break;
          }
          case RequestMethod.METAMASK.ETH_ESTIMATE_GAS: {
            const [transaction] = params as TransactionRequest[];

            if (transaction) {
              rpcProvider
                .estimateGas(transaction)
                .then((gas) => resolve(gas.toString()))
                .catch(reject);
            }

            break;
          }
          case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
            const [param] = params ?? [];

            if (param?.chainId) {
              if (isSupportedChain(param?.chainId)) {
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
                  handleEthereumRequest(
                    {
                      method: RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN,
                      params,
                    },
                    sender
                  )
                    .then(() => resolve(param.chainId))
                    .catch(reject);
                }
              } else {
                reject("Chain not Supported");
              }
            } else {
              reject(); // chainId is required
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_BALANCE: {
            const [address, tag] = params ?? [];

            if (address && tag) {
              rpcProvider
                .getBalance(String(address), String(tag))
                .then((value) => resolve(value.toString()))
                .catch(reject);
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_BLOCK_BY_NUMBER: {
            const [tag, refresh] = params ?? [];

            if (tag && refresh) {
              rpcProvider
                .getBlock(String(tag), Boolean(refresh))
                .then((block) => resolve(block?.toJSON()))
                .catch(reject);
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GAS_PRICE: {
            rpcProvider
              .getFeeData()
              .then(({ gasPrice }) =>
                resolve((gasPrice ?? BigInt(0)).toString())
              )
              .catch(reject);

            break;
          }
          case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
            rpcProvider
              .getFeeData()
              .then(({ maxPriorityFeePerGas }) =>
                resolve((maxPriorityFeePerGas ?? BigInt(0)).toString())
              )
              .catch(reject);

            break;
          }
          case RequestMethod.METAMASK.ETH_CALL: {
            const [transaction] = params as ITransaction.METAMASK[];

            transaction ? resolve(rpcProvider.call(transaction)) : reject();

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_TRANSACTION_RECEIPT: {
            const [transaction] = params as ITransaction.METAMASK[];

            rpcProvider
              .getTransactionReceipt(String(transaction))
              .then((receipt) => resolve(receipt?.toJSON()))
              .catch(reject);

            break;
          }
          case "net_version": {
            resolve("1");

            break;
          }
          default: {
            // _emit(EventMethod.ERROR, new Error(`Unsupported method: ${method}`));
            reject(`Unsupported method: ${method}`);

            break;
          }
        }
      }
    });
  });
};

const handleLitecoinCashRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.LITECOIN);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.LITECOIN, sender.origin).then((accounts) =>
            resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleMayaRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.MAYACHAIN);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.MAYACHAIN, sender.origin).then(
            (accounts) => resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleSolanaRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.SOLANA);

    if (chain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.SOLANA, sender.origin).then((accounts) =>
            resolve(accounts)
          );

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

const handleThorRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const chain = chains.find((chain) => chain.name == ChainKey.THORCHAIN);

    if (chain && sender.origin) {
      switch (method) {
        // VULTISIG Methods
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.THORCHAIN, sender.origin).then(resolve);

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: {
          const [hash] = params;
          const path = rpcUrl[chain.name];

          if (path && typeof hash === "string")
            api.getTransactionByHash(path, hash).then(resolve);

          break;
        }
        // CTRL Methods
        case RequestMethod.CTRL.TRANSFER: {
          const [_transaction] = params as ITransaction.CTRL[];

          if (_transaction) {
            const transaction = {
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              value: _transaction.amount.amount.toString(),
            } as ITransaction.METAMASK;

            handleSendTransaction(transaction, chain)
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        case RequestMethod.CTRL.DEPOSIT: {
          const [_transaction] = params as ITransaction.CTRL[];

          if (_transaction) {
            const transaction = {
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              value: _transaction.amount.amount.toString(),
            } as ITransaction.METAMASK;

            handleSendTransaction(transaction, chain) //send isDeposit as boolean
              .then(resolve)
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        default: {
          reject(`Unsupported method: ${method}`);

          break;
        }
      }
    }
  });
};

chrome.runtime.onMessage.addListener(
  (
    { message, type }: { message: any; type: MessageKey },
    sender,
    sendResponse
  ) => {
    switch (type) {
      case MessageKey.BITCOIN_REQUEST: {
        handleBitcoinRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.BITCOIN_CASH_REQUEST: {
        handleBitcoinCashRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.COSMOS_REQUEST: {
        handleCosmosRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.DOGECOIN_REQUEST: {
        handleDogecoinCashRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.ETHEREUM_REQUEST: {
        handleEthereumRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.LITECOIN_REQUEST: {
        handleLitecoinCashRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.MAYA_REQUEST: {
        handleMayaRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.SOLANA_REQUEST: {
        handleSolanaRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.THOR_REQUEST: {
        handleThorRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.VAULTS: {
        handleGetVaults().then(sendResponse);

        break;
      }
      default: {
        break;
      }
    }

    return true;
  }
);

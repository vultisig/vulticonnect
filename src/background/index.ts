import { v4 as uuidv4 } from "uuid";
import { JsonRpcProvider, TransactionRequest } from "ethers";
//import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import {
  ChainKey,
  CosmosChain,
  EVMChain,
  MessageKey,
  RequestMethod,
  chains,
  rpcUrl,
} from "utils/constants";
import { calculateWindowPosition, isSupportedChain } from "utils/functions";
import { ChainProps, ITransaction, Messaging } from "utils/interfaces";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  getIsPriority,
  getStoredChains,
  getStoredTransactions,
  getStoredVaults,
  setIsPriority,
  setStoredChains,
  setStoredRequest,
  setStoredTransactions,
  setStoredVaults,
} from "utils/storage";
import api from "utils/api";
import axios from "axios";

let rpcProvider: JsonRpcProvider;

const handleAccounts = (chain: ChainKey, sender: string): Promise<string[]> => {
  return new Promise((resolve) => {
    getStoredVaults()
      .then((vaults) => {
        resolve(
          vaults.flatMap(({ apps, chains }) =>
            apps
              ? chains
                  .filter(
                    ({ name }) => name === chain && apps.indexOf(sender) >= 0
                  )
                  .map(({ address }) => address ?? "")
              : []
          )
        );
      })
      .catch(() => resolve([]));
  });
};

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
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow);

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
    handleAccounts(chain, sender).then((accounts) => {
      if (accounts.length) {
        resolve(accounts);
      } else {
        setStoredRequest({
          chain,
          sender,
        }).then(() => {
          handleOpenPanel("accounts").then((createdWindowId) => {
            chrome.windows.onRemoved.addListener((closedWindowId) => {
              if (closedWindowId === createdWindowId)
                handleAccounts(chain, sender).then(resolve);
            });
          });
        });
      }
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
  chain: ChainProps,
  isDeposit?: boolean
): Promise<{ txHash: string; raw: any }> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then((transactions) => {
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
                        resolve({
                          txHash: transaction.txHash!,
                          raw: transaction.raw,
                        });
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
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.VULTISIG.SEND_TRANSACTION: {
            const [transaction] = params as ITransaction.METAMASK[];

            if (transaction) {
              handleSendTransaction(transaction, activeChain)
                .then((result) => resolve(result.txHash))
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
          case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: {
            const [hash] = params;

            Tendermint34Client.connect(rpcUrl[activeChain.name])
              .then((client) => {
                client
                  .tx({ hash: Buffer.from(String(hash)) })
                  .then(({ result }) => resolve(JSON.stringify(result)))
                  .catch(reject);
              })
              .catch((error) =>
                reject(`Could not initialize Tendermint Client: ${error}`)
              );
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

const handleEthereumRequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;

    getStoredChains().then((storedChains) => {
      let chain = storedChains.find(
        (chain) =>
          (Object.values(EVMChain) as unknown as ChainKey[]).includes(
            chain.name
          ) && chain.active === true
      );
      if (!chain) {
        chain = chains.find((chain) => chain.name == ChainKey.ETHEREUM);
        handleEthereumRequest(
          {
            method: RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN,
            params: [{ chainId: "0x1" }],
          },
          sender
        );
      }

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
            handleGetAccounts(chain.name, sender.origin).then(resolve);

            break;
          }
          case RequestMethod.METAMASK.ETH_SEND_TRANSACTION: {
            const [transaction] = params as ITransaction.METAMASK[];

            if (transaction) {
              handleSendTransaction(transaction, chain)
                .then((result) => resolve(result.txHash))
                .catch(reject);
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_TRANSACTION_BY_HASH: {
            const [hash] = params!;
            if (hash) {
              axios
                .post(rpcUrl[chain.name], {
                  id: 1,
                  jsonrpc: "2.0",
                  method: "eth_getTransactionByHash",
                  params: [hash],
                })
                .then((res) => {
                  resolve(res.data.result);
                })
                .catch(reject);
            } else {
              reject();
            }
            break;
          }
          case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
            rpcProvider
              .getBlock("latest")
              .then((block) => resolve(String(block?.number)))
              .catch(reject);

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
                reject();
              }
            } else {
              reject();
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
              reject();
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
            } else {
              reject();
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
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.METAMASK.ETH_GAS_PRICE: {
            rpcProvider
              .getFeeData()
              .then(({ gasPrice }) => resolve(gasPrice!.toString()))
              .catch(reject);

            break;
          }
          case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
            rpcProvider
              .getFeeData()
              .then(({ maxPriorityFeePerGas }) =>
                resolve(maxPriorityFeePerGas!.toString())
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
              .then((receipt) => {
                if (receipt) resolve(receipt?.toJSON());
                else reject();
              })
              .catch(reject);

            break;
          }
          case RequestMethod.METAMASK.ETH_GET_CODE: {
            const [address, tag] = params ?? [];

            if (address && tag) {
              rpcProvider
                .getCode(String(address), String(tag))
                .then((value) => resolve(value.toString()))
                .catch(reject);
            } else {
              reject();
            }

            break;
          }
          case RequestMethod.METAMASK.PERSONAL_SIGN: {
            const [message, address] = params;
            handleSendTransaction(
              {
                customMessage: {
                  address: String(address),
                  message: String(message),
                },
                isCustomMessage: true,
                chain: chain,
                data: "",
                from: String(address),
                id: "",
                status: "default",
                to: "",
                isDeposit: false,
              },
              chain
            )
              .then((result) => {
                resolve(result.txHash);
              })
              .catch(reject);

            break;
          }
          case "net_version": {
            resolve("1");

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

const handleUTXORequest = (
  body: Messaging.Chain.Request,
  sender: chrome.runtime.MessageSender,
  chainKey: ChainKey
): Promise<Messaging.Chain.Response> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    const UTXOChain = chains.find((chain) => chain.name === chainKey);

    if (UTXOChain && sender.origin) {
      switch (method) {
        case RequestMethod.VULTISIG.GET_ACCOUNTS: {
          getStoredVaults().then((vaults) => {
            resolve(
              vaults.flatMap(({ apps, chains }) =>
                chains
                  .filter(
                    ({ name }) =>
                      name === UTXOChain.name &&
                      apps!.indexOf(sender.origin!) >= 0
                  )
                  .map(({ address }) => address ?? "")
              )
            );
          });

          break;
        }
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          // RETURNS AND ARRAY OF ACCOUNT ADDRESSES!
          handleGetAccounts(chainKey, sender.origin).then(resolve);

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, UTXOChain)
              .then((result) => resolve(result.txHash))
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
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

            handleSendTransaction(transaction, UTXOChain)
              .then((result) => resolve(result.txHash))
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: {
          const [hash] = params;
          api.utxo
            .blockchairGetTx(chainKey, String(hash))
            .then((res) => resolve(JSON.stringify(res)))
            .catch(reject);
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
          handleGetAccounts(ChainKey.MAYACHAIN, sender.origin).then(resolve);

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then((result) => resolve(result.txHash))
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
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
              .then((result) => resolve(result.txHash))
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
          handleGetAccounts(ChainKey.SOLANA, sender.origin).then(resolve);

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [_transaction] = params as any;
          if (_transaction) {
            const transaction = {
              data: "",
              from: _transaction.fromPubkey,
              gasLimit: "",
              to: _transaction.toPubkey,
              value: _transaction.lamports,
            } as ITransaction.METAMASK;

            handleSendTransaction(transaction, chain)
              .then((result) => {
                resolve([result.txHash, result.raw]);
              })
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        case RequestMethod.CTRL.SIGN_TRANSACTION: {
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
        case RequestMethod.VULTISIG.GET_ACCOUNTS: {
          getStoredVaults().then((vaults) => {
            resolve(
              vaults.flatMap(({ apps, chains }) =>
                chains
                  .filter(
                    ({ name }) =>
                      name === chain.name && apps!.indexOf(sender.origin!) >= 0
                  )
                  .map(({ address }) => address ?? "")
              )
            );
          });

          break;
        }
        case RequestMethod.VULTISIG.DEPOSIT_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain, true)
              .then((result) => resolve(result.txHash))
              .catch(reject);
          } else {
            reject();
          }
          break;
        }
        case RequestMethod.VULTISIG.REQUEST_ACCOUNTS: {
          handleGetAccounts(ChainKey.THORCHAIN, sender.origin).then(resolve);

          break;
        }
        case RequestMethod.VULTISIG.SEND_TRANSACTION: {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then((result) => resolve(result.txHash))
              .catch(reject);
          } else {
            reject();
          }

          break;
        }
        // TO DO
        case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: {
          const [hash] = params;

          api.thorchain
            .getTransactionByHash(String(hash))
            .then(resolve)
            .catch(reject);
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
              .then((result) => resolve(result.txHash))
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
              .then((result) => resolve(result.txHash))
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

const handleSetPriority = (body: Messaging.SetPriority.Request) => {
  return new Promise(async (resolve) => {
    if (body.priority) {
      setIsPriority(body.priority);
      resolve(body.priority);
    } else {
      resolve(await getIsPriority());
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
        handleUTXORequest(message, sender, ChainKey.BITCOIN).then(sendResponse);

        break;
      }
      case MessageKey.BITCOIN_CASH_REQUEST: {
        handleUTXORequest(message, sender, ChainKey.BITCOINCASH).then(
          sendResponse
        );

        break;
      }
      case MessageKey.COSMOS_REQUEST: {
        handleCosmosRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.DASH_REQUEST: {
        handleUTXORequest(message, sender, ChainKey.DASH).then(sendResponse);

        break;
      }
      case MessageKey.DOGECOIN_REQUEST: {
        handleUTXORequest(message, sender, ChainKey.DOGECOIN).then(
          sendResponse
        );

        break;
      }
      case MessageKey.ETHEREUM_REQUEST: {
        handleEthereumRequest(message, sender).then(sendResponse);

        break;
      }
      case MessageKey.LITECOIN_REQUEST: {
        handleUTXORequest(message, sender, ChainKey.LITECOIN).then(
          sendResponse
        );

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
      case MessageKey.SET_PRIORITY: {
        handleSetPriority(message).then(sendResponse);
        break;
      }
      default: {
        break;
      }
    }

    return true;
  }
);

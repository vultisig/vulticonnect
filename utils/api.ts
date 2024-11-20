import axios from "axios";

import { toCamelCase, toSnakeCase } from "~utils/functions";
import type { Currency } from "~utils/constants";
import type {
  CosmosAccountData,
  CosmosAccountDataResponse,
  MayaAccountDataResponse,
  SignatureProps,
  ThorchainAccountDataResponse,
} from "~utils/interfaces";
import { resolve } from "path";

const api = axios.create({
  headers: { accept: "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

api.interceptors.response.use((response) => {
  response.data = toCamelCase(response.data);

  return response;
});

namespace CryptoCurrency {
  export interface Props {
    data: {
      [id: string]: {
        quote: {
          [currency: string]: {
            price: number;
          };
        };
      };
    };
  }
}

namespace Derivation {
  export interface Params {
    publicKeyEcdsa: string;
    hexChainCode: string;
    derivePath: string;
  }

  export interface Props {
    publicKey: string;
  }
}

export default {
  transaction: {
    getComplete: async (uuid: string, message: string) => {
      return new Promise((resolve, reject) => {
        api
          .get<SignatureProps>(
            `https://api.vultisig.com/router/complete/${uuid}/keysign`,
            {
              headers: { message_id: message },
            }
          )
          .then((res) => {
            if (res.status === 200) {
              const transformed = Object.entries(res.data).reduce(
                (acc, [key, value]) => {
                  const newKey = key.charAt(0).toUpperCase() + key.slice(1);
                  acc[newKey] = value;
                  return acc;
                },
                {} as { [key: string]: any }
              );
              resolve(transformed);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getDevices: async (uuid: string) => {
      return await api.get<string[]>(`https://api.vultisig.com/router/${uuid}`);
    },
    setStart: async (uuid: string, devices: string[]) => {
      return await api.post(
        `https://api.vultisig.com/router/start/${uuid}`,
        devices
      );
    },
  },
  checkVaultExist: (ecdsa: string): Promise<boolean> => {
    return new Promise((resolve) => {
      api
        .get(`https://api.vultisig.com/vault/exist/${ecdsa}`)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  },
  cryptoCurrency: (cmcId: number, currency: Currency): Promise<number> => {
    return new Promise((resolve) => {
      api
        .get<CryptoCurrency.Props>(
          `https://api.vultisig.com/cmc/v2/cryptocurrency/quotes/latest?id=${cmcId}&aux=platform&convert=${currency}`
        )
        .then(({ data }) => {
          if (
            data?.data &&
            data.data[cmcId]?.quote &&
            data.data[cmcId].quote[currency]?.price
          ) {
            resolve(data.data[cmcId].quote[currency].price);
          } else {
            resolve(0);
          }
        })
        .catch(() => {
          resolve(0);
        });
    });
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "https://airdrop.odindex.io/api/derive-public-key",
      toSnakeCase(params)
    );
  },
  getIsFunctionSelector: async (hexFunction: string) => {
    return new Promise<boolean>((resolve) => {
      api
        .get(
          `https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then((res) => {
          if (res.data.count > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => {
          resolve(false);
        });
    });
  },
  getFunctionSelector: async (hexFunction: string) => {
    return new Promise<string>((resolve, reject) => {
      api
        .get(
          `https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then((res) => {
          resolve(res.data.results[0].textSignature);
        })
        .catch(() => {
          reject("Error getting FunctionSelector Text");
        });
    });
  },
  thorchain: {
    fetchAccountNumber: async (address: string) => {
      return new Promise<ThorchainAccountDataResponse>((resolve, reject) => {
        const url = `https://thornode.ninerealms.com/auth/accounts/${address}`;
        api
          .get(url, {
            headers: {
              "X-Client-ID": "vultisig",
            },
          })
          .then((res) => {
            resolve(res.data.result.value);
          })
          .catch(reject);
      });
    },
    getFeeData: () => {
      return new Promise((resolve, reject) => {
        const url = "https://thornode.ninerealms.com/thorchain/network";
        api
          .get(url)
          .then((res) => {
            resolve(res.data.nativeTxFeeRune);
          })
          .catch(reject);
      });
    },

    getTHORChainChainID(): Promise<string> {
      return new Promise((resolve, reject) => {
        const url = "https://rpc.ninerealms.com/status";
        api
          .get(url)
          .then((res) => {
            const network = res.data.result.nodeInfo.network;
            resolve(network);
          })
          .catch(reject);
      });
    },
    getTransactionByHash(hash: string): Promise<any> {
      return new Promise((resolve, reject) => {
        const url = "https://thornode.ninerealms.com/txs";
        api
          .get(`${url}/${hash}`)
          .then((res) => {
            resolve(res.data.tx);
          })
          .catch(reject);
      });
    },
  },
  maya: {
    fetchAccountNumber: async (address: string) => {
      return new Promise<MayaAccountDataResponse>((resolve, reject) => {
        const url = `https://mayanode.mayachain.info/auth/accounts/${address}`;
        api
          .get(url)
          .then((res) => {
            resolve(res.data.result.value);
          })
          .catch(reject);
      });
    },
  },
  cosmos: {
    getAccountData(url: string): Promise<CosmosAccountData> {
      return new Promise((resolve, reject) => {
        api
          .get<CosmosAccountDataResponse>(url)
          .then((response) => {
            if (!response.data.account) reject("no account found");
            else resolve(response.data.account);
          })
          .catch(reject);
      });
    },
  },
};

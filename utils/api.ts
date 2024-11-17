import axios from "axios";

import { toCamelCase, toSnakeCase } from "~utils/functions";
import type { Currency } from "~utils/constants";
import type {
  SignatureProps,
  ThorchainAccountDataResponse,
} from "~utils/interfaces";
import { resolve } from "path";

const api = axios.create({
  headers: { accept: "application/json" },
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
        .get(`https://api.etherface.io/v1/signatures/hash/all/${hexFunction}/1`)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  },
  getFunctionSelector: async (hexFunction: string) => {
    return new Promise<string>((resolve, reject) => {
      api
        .get(`https://api.etherface.io/v1/signatures/hash/all/${hexFunction}/1`)
        .then((res) => {
          resolve(res.data.items[0].text);
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
            console.log("getFeeData");
            console.log(res);
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
  },
};
// https://api.vultisig.com/router/complete/8adb9484-1281-488a-9317-55b7342305a4/keysign
// {"Msg":"urEXgamwaKXGaYqmnk2qDdpaZIByR5ExGX1B5ODcPGk=","R":"9a2c1d9a52b5d139b8a54e97ef9b969315b1c8687bfd5e27bc5fda565734f28e","S":"42539d630bd95967d7c5a3a3c4c66fdbc31fbb7183fcd983f60b37b7bbd7399c","DerSignature":"30450221009a2c1d9a52b5d139b8a54e97ef9b969315b1c8687bfd5e27bc5fda565734f28e022042539d630bd95967d7c5a3a3c4c66fdbc31fbb7183fcd983f60b37b7bbd7399c","RecoveryID":"00"}
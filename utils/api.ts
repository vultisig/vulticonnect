import axios from "axios";

import { toCamelCase, toSnakeCase } from "~utils/functions";
import type { Currency } from "~utils/constants";
import type { SignatureProps } from "~utils/interfaces";

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
      return await api.get<SignatureProps>(
        `https://api.vultisig.com/router/complete/${uuid}/keysign`,
        {
          headers: { message_id: message },
        }
      );
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
      "https://web.vultisig.com/api/derive-public-key",
      toSnakeCase(params)
    );
  },
};

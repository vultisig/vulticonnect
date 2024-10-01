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
  cryptoCurrency: async (cmcId: number, currency: Currency) => {
    return await api.get<CryptoCurrency.Props>(
      `https://api.vultisig.com/cmc/v2/cryptocurrency/quotes/latest?id=${cmcId}&aux=platform&convert=${currency}`
    );
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "https://airdrop.odindex.io/api/derive-public-key",
      toSnakeCase(params)
    );
  },
};

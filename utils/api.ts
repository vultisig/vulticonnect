import axios from "axios";

import { toCamelCase, toSnakeCase } from "~utils/functions";

const api = axios.create({
  headers: { accept: "application/json" },
});

api.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

api.interceptors.response.use(
  (response) => {
    response.data = toCamelCase(response.data);

    return response;
  },
  ({ response }) => {
    return Promise.reject(response.data.error);
  }
);

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
    get: async (status: "" | "start" | "complete", uuid: string) => {
      return await api.get<string[]>(
        `https://api.vultisig.com/router/${status ? `${status}/` : ""}${uuid}`
      );
    },
    set: async (devices: string[], uuid: string) => {
      return await api.post(
        `https://api.vultisig.com/router/start/${uuid}`,
        devices
      );
    },
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "https://web.vultisig.com/api/derive-public-key",
      toSnakeCase(params)
    );
  },
};

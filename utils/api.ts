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
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "https://airdrop.odindex.io/api/derive-public-key",
      toSnakeCase(params)
    );
  },
};

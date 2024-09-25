import { formatUnits } from "ethers";

import { rpcUrl, type ChainKey } from "~utils/constants";

interface RpcPayload {
  method: string;
  params: any[];
  jsonrpc?: string;
  id?: number;
}

interface RpcResponse {
  id: number;
  result: string | null;
  error: RpcError | null;
}

interface RpcError {
  code: number;
  message: string;
}

const fetchAPI = <T>(chain: ChainKey, payload: RpcPayload): Promise<T> => {
  return new Promise((resolve, reject) => {
    const url = rpcUrl[chain];

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(resolve)
      .catch(reject);
  });
};

export const getGasLimit = (): number => {
  return 40000;
};

export const getNonce = (chain: ChainKey, address: string): Promise<bigint> => {
  return new Promise((resolve) => {
    const payload = {
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [address, "latest"],
      id: 1,
    };

    fetchAPI<RpcResponse>(chain, payload)
      .then((response) => {
        resolve(BigInt(response?.result ? response.result : 0) + 1n);
      })
      .catch(() => {
        resolve(BigInt(0));
      });
  });
};

export const getGasPrice = (chain: ChainKey): Promise<bigint> => {
  return new Promise((resolve) => {
    const payload = {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1,
    };

    fetchAPI<RpcResponse>(chain, payload)
      .then((response) => {
        resolve(BigInt(response.result ?? 0));
      })
      .catch(() => {
        resolve(BigInt(0));
      });
  });
};

export const getMaxPriorityFeePerGas = (chain: ChainKey): Promise<bigint> => {
  return new Promise((resolve) => {
    const payload = {
      jsonrpc: "2.0",
      method: "eth_maxPriorityFeePerGas",
      params: [],
      id: 1,
    };

    fetchAPI<RpcResponse>(chain, payload)
      .then((response) => {
        resolve(
          BigInt(response?.result ? response.result.replace(/^0x/, "") : 0)
        );
      })
      .catch(() => {
        resolve(BigInt(0));
      });
  });
};

export const getBaseFeePerGas = (chain: ChainKey): Promise<bigint> => {
  return new Promise((resolve) => {
    const payload = {
      jsonrpc: "2.0",
      method: "eth_feeHistory",
      params: ["0x1", "latest", []],
      id: 1,
    };

    fetchAPI<RpcResponse>(chain, payload)
      .then((response) => {
        const baseFeePerGasHex = (response.result as any).baseFeePerGas?.[0];

        resolve(BigInt(baseFeePerGasHex ?? 0));
      })
      .catch(() => {
        resolve(BigInt(0));
      });
  });
};

export const estimateTransactionFee = (chain: ChainKey): Promise<string> => {
  return new Promise((resolve) => {
    Promise.all([
      getBaseFeePerGas(chain),
      getMaxPriorityFeePerGas(chain),
      BigInt(getGasLimit()),
    ])
      .then(([baseFeePerGas, maxPriorityFeePerGas, gasLimit]) => {
        const totalFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
        const estimatedFeeInWei = totalFeePerGas * gasLimit;
        const estimatedFeeInGwei = formatUnits(estimatedFeeInWei, "gwei");

        resolve(estimatedFeeInGwei);
      })
      .catch(() => {});
  });
};

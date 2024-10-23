import { Interface } from "ethers";
import api from "./api";
import { evmSupportedChains } from "./constants";
import type { ParsedMemo } from "./interfaces";

const hexToAscii = (value: string): string => {
  const hex: string = value.toString().replace("0x", "");

  let str: string = "";

  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }

  return str;
};

const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr);
};

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== "function";
};

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const toSnake = (value: string): string => {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {};

    Object.keys(obj).forEach((k) => {
      n[toCamel(k)] = toCamelCase(obj[k]);
    });

    return n;
  } else if (isArray(obj)) {
    return obj.map((i) => {
      return toCamelCase(i);
    });
  }

  return obj;
};

const toSnakeCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {};

    Object.keys(obj).forEach((k) => {
      n[toSnake(k)] = toSnakeCase(obj[k]);
    });

    return n;
  } else if (isArray(obj)) {
    return obj.map((i) => {
      return toSnakeCase(i);
    });
  }

  return obj;
};

const checkERC20Function = async (inputHex: string): Promise<boolean> => {
  if (!inputHex || inputHex == "0x")
    return new Promise((resolve) => resolve(false));
  const functionSelector = inputHex.slice(0, 10); // "0x" + 8 hex chars

  const res = await api.getIsFunctionSelector(functionSelector);
  return res;
};

const getFunctionSignature = async (inputHex: string): Promise<string> => {
  if (!inputHex || inputHex == "0x")
    return new Promise((resolve, reject) => reject(""));
  const functionSelector = inputHex.slice(0, 10); // "0x" + 8 hex chars

  const res = await api.getFunctionSelector(functionSelector);
  return res;
};

const parseMemo = async (memo: string) => {
  return new Promise<ParsedMemo>((resolve, reject) => {
    getFunctionSignature(memo)
      .then((signature) => {
        const abi = new Interface([`function ${signature}`]);
        try {
          const decodedData = abi.decodeFunctionData(
            signature.split("(")[0],
            memo
          );
          const processedData = processDecodedData(decodedData);
          console.log(processedData);
          resolve({
            signature: signature,
            inputs: JSON.stringify(processedData, null, 2),
          });
        } catch (error) {
          console.error("Error decoding input data:", error);
        }
      })
      .catch(reject);
  });
};

const processDecodedData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map((item) => processDecodedData(item));
  } else if (typeof data === "bigint") {
    return data.toString();
  } else if (typeof data === "object" && data !== null) {
    if (data.toString && (data._isBigNumber || typeof data === "bigint")) {
      return data.toString();
    }
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = processDecodedData(data[key]);
      return acc;
    }, {} as any);
  }
  return data;
};

const isSupportedChain = (chainId: string): boolean => {
  return evmSupportedChains.some((chain) => chain.id === chainId);
};

export {
  hexToAscii,
  toCamelCase,
  toSnakeCase,
  checkERC20Function,
  parseMemo,
  isSupportedChain,
};

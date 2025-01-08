import { Interface } from "ethers";
import api from "./api";
import { allSupportedChains } from "./constants";
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
  return allSupportedChains.some((chain) => chain.id === chainId);
};

function splitString(str: string, size: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size));
  }
  return result;
}

function calculateWindowPosition(currentWindow: chrome.windows.Window) {
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
  return { height, left, top, width };
}

const formatDisplayNumber = (_number: number | string, ticker: string) => {
  if (String(_number).includes("$")) {
    // gasPrice is in usd and already formatted
    return _number;
  }
  const n = Number(_number);
  if (n === 0) {
    return "0";
  } else if (n < 0.0000001) {
    return `${n.toFixed(9)} ${ticker}`;
  } else if (n < 0.000001) {
    return `${n.toFixed(8)} ${ticker}`;
  } else if (n < 0.00001) {
    return `${n.toFixed(7)} ${ticker}`;
  } else if (n < 0.0001) {
    return `${n.toFixed(6)} ${ticker}`;
  } else if (n < 0.001) {
    return `${n.toFixed(5)} ${ticker}`;
  } else if (n < 0.01) {
    return `${n.toFixed(4)} ${ticker}`;
  } else if (n < 1) {
    return `${n.toFixed(3)} ${ticker}`;
  } else if (n < 2) {
    return `${n.toFixed(2)} ${ticker}`;
  } else if (n < 10000) {
    return `${n.toFixed(0)} ${ticker}`;
  } else if (n < 100000) {
    return `${Number((n / 1000).toFixed(0)).toLocaleString()}K ${ticker}`;
  } else {
    return `${Number((n / 1000000).toFixed(0)).toLocaleString()}M ${ticker}`;
  }
};

export {
  hexToAscii,
  toCamelCase,
  toSnakeCase,
  checkERC20Function,
  parseMemo,
  isSupportedChain,
  splitString,
  calculateWindowPosition,
  formatDisplayNumber,
};

import api from "./api";
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

const getFunctionName = async (inputHex: string): Promise<string> => {
  if (!inputHex || inputHex == "0x")
    return new Promise((resolve, reject) => reject(""));
  const functionSelector = inputHex.slice(0, 10); // "0x" + 8 hex chars

  const res = await api.getFunctionSelector(functionSelector);
  return res;
};

const parseMemo = async (memo: string) => {
  return new Promise<ParsedMemo>((resolve, reject) => {
    getFunctionName(memo)
      .then((name) => {
        const inputs = splitString(memo.slice(10), 64);
        resolve({ name: name, inputs: inputs });
      })
      .catch(reject);
  });
};

function splitString(str: string, size: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size));
  }
  return result;
}

function removeLeadingZeros(hexString: string): string {
  return hexString.replace(/^0+/, '') || "0";
}

export { hexToAscii, toCamelCase, toSnakeCase, checkERC20Function, parseMemo, removeLeadingZeros };

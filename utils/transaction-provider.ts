import {  type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";


import { ChainKey } from "~utils/constants";
import ThorchainTransactionProvider from "./thorchain-tx-provider";
import EVMTransactionProvider from "./evm-tx-provider";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class TransactionProvider {
  static createProvider(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    switch (chainKey) {
      case ChainKey.THORCHAIN: {
        return new ThorchainTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      default: {
        return new EVMTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
    }
  }
}

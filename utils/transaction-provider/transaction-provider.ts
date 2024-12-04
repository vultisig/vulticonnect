import { type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey } from "~utils/constants";
import ThorchainTransactionProvider from "./thorchain/thorchain-tx-provider";
import EVMTransactionProvider from "./evm/evm-tx-provider";
import MayaTransactionProvider from "./maya/maya-tx-provider";
import GaiaTransactionProvider from "./gaia/gaia-tx-provider";
import OsmosisTransactionProvider from "./osmosis/osmosis-tx-provider";
import KujiraTransactionProvider from "./kujira/kujira-tx-provider";
import DydxTransactionProvider from "./dydx/dydx-tx-provider";

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
      case ChainKey.MAYACHAIN: {
        return new MayaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.GAIACHAIN: {
        return new GaiaTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.OSMOSIS: {
        return new OsmosisTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.KUJIRA: {
        return new KujiraTransactionProvider(
          chainKey,
          chainRef,
          dataEncoder,
          walletCore
        );
      }
      case ChainKey.DYDX: {
        return new DydxTransactionProvider(
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

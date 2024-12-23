import { WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey } from "utils/constants";
import BaseTransactionProvider from "utils/transaction-provider/base";
import CosmosTransactionProvider from "utils/transaction-provider/cosmos";
import EVMTransactionProvider from "utils/transaction-provider/evm";
import GaiaTransactionProvider from "utils/transaction-provider/gaia";
import MayaTransactionProvider from "utils/transaction-provider/maya";
import ThorchainTransactionProvider from "utils/transaction-provider/thorchain";

export {
  BaseTransactionProvider,
  CosmosTransactionProvider,
  EVMTransactionProvider,
  GaiaTransactionProvider,
  MayaTransactionProvider,
  ThorchainTransactionProvider,
};

export class TransactionProvider {
  static createProvider(
    chainKey: ChainKey,
    chainRef: { [chainKey: string]: CoinType },
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
      case ChainKey.OPTIMISM: {
        return new GaiaTransactionProvider(
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

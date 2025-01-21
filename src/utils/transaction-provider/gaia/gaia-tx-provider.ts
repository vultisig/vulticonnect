import { type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import { ChainKey } from "~utils/constants";

import CosmosTransactionProvider from "../cosmos/cosmos-tx-provider";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class GaiaTransactionProvider extends CosmosTransactionProvider {
  constructor(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore);
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  protected accountNumberURL(address: string): string | null {
    return `https://cosmos-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  protected denom(): string {
    return "uatom";
  }
}

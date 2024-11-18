import {
  JsonRpcProvider,
  Transaction,
  encodeBase64,
  formatUnits,
  hexlify,
  isHexString,
  keccak256,
  randomBytes,
  toUtf8Bytes,
  toUtf8String,
} from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";
import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import {
  EthereumSpecificSchema,
  type EthereumSpecific,
} from "~protos/blockchain_specific_pb";
import { CoinSchema } from "~protos/coin_pb";
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";

import { ChainKey, Currency, rpcUrl } from "~utils/constants";
import type {
  SignatureProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import api from "./api";
import { checkERC20Function } from "./functions";
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

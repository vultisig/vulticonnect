import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import type { ChainKey } from "~utils/constants";
import type {
  SignatureProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import { randomBytes } from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";
import {
  KeysignMessageSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";

interface ChainRef {
  [chainKey: string]: CoinType;
}
export abstract class BaseTransactionProvider {
  protected chainKey: ChainKey;
  protected chainRef: ChainRef;
  protected dataEncoder: (data: Uint8Array) => Promise<string>;
  protected walletCore: WalletCore;
  protected keysignPayload: KeysignPayload;
  constructor(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  protected stripHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  };

  public getPreSignedImageHash = (
    preSignedInputData: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
          this.chainRef[this.chainKey],
          preSignedInputData
        );
        const preSigningOutput =
          TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);
        if (preSigningOutput.errorMessage !== "")
          reject(preSigningOutput.errorMessage);

        const imageHash = this.stripHexPrefix(
          this.walletCore.HexCoding.encode(preSigningOutput.dataHash)
        );
        resolve(imageHash);
      } catch (err) {
        console.error(`error getting preSignedImageHash: ${err}`);
        reject(err);
      }
    });
  };

  public getTransactionKey = (
    publicKeyEcdsa: string,
    transactionId: string,
    hexChainCode: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const keysignMessage = create(KeysignMessageSchema, {
        sessionId: transactionId,
        serviceName: "VultiConnect",
        encryptionKeyHex: hexChainCode,
        useVultisigRelay: true,
        keysignPayload: this.keysignPayload,
      });

      const binary = toBinary(KeysignMessageSchema, keysignMessage);

      this.dataEncoder(binary).then((base64EncodedData) => {
        resolve(
          `vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyEcdsa}&jsonData=${base64EncodedData}`
        );
      });
    });
  };

  abstract getPreSignedInputData(): Promise<Uint8Array>;

  abstract getSignedTransaction(
    transaction: TransactionProps,
    signature: SignatureProps,
    inputData: Uint8Array,
    vault: VaultProps
  ): Promise<string>;

  abstract getKeysignPayload(
    transaction: TransactionProps,
    vault: VaultProps
  ): Promise<KeysignPayload>;

  protected encodeData(data: Uint8Array): Promise<string> {
    return this.dataEncoder(data);
  }

  public getDerivePath = (chain: string) => {
    const coin = this.chainRef[chain];
    return this.walletCore.CoinTypeExt.derivationPath(coin);
  };

  public getHexPubKey = () => {
    return this.keysignPayload.coin.hexPublicKey;
  };
}

import { randomBytes } from "ethers";
import { TW, WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import { create, toBinary } from "@bufbuild/protobuf";

import { ChainKey } from "utils/constants";
import {
  SignedTransaction,
  TransactionProps,
  VaultProps,
} from "utils/interfaces";

import {
  KeysignMessageSchema,
  KeysignPayload,
} from "protos/keysign_message_pb";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default abstract class BaseTransactionProvider {
  protected chainKey: ChainKey;
  protected chainRef: ChainRef;
  protected dataEncoder: (data: Uint8Array) => Promise<string>;
  protected walletCore: WalletCore;
  protected keysignPayload?: KeysignPayload;

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

  protected encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  protected stripHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  };

  public getPreSignedImageHash = (
    preSignedInputData: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
        this.chainRef[this.chainKey],
        preSignedInputData
      );

      const preSigningOutput =
        TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

      if (preSigningOutput.errorMessage !== "")
        reject(preSigningOutput.errorMessage);

      const imageHash = this.walletCore.HexCoding.encode(
        preSigningOutput.dataHash
      )?.replace(/^0x/, "");

      resolve(imageHash);
    });
  };

  public getTransactionKey = (
    publicKeyEcdsa: string,
    transactionId: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const keysignMessage = create(KeysignMessageSchema, {
        sessionId: transactionId,
        serviceName: "VultiConnect",
        encryptionKeyHex: this.encryptionKeyHex(),
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

  abstract getSignedTransaction({
    inputData,
    signature,
    transaction,
    vault,
  }: SignedTransaction): Promise<string>;

  abstract getKeysignPayload(
    transaction: TransactionProps,
    vault: VaultProps
  ): Promise<KeysignPayload>;

  protected encodeData(data: Uint8Array): Promise<string> {
    return this.dataEncoder(data);
  }
}

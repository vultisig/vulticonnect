import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import { ChainKey } from "~utils/constants";
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
import type { CustomMessagePayload } from "~protos/custom_message_payload_pb";

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
    transaction: TransactionProps
  ): Promise<string> => {
    return new Promise((resolve) => {
      let messsage: {
        sessionId: string;
        serviceName: string;
        encryptionKeyHex: string;
        useVultisigRelay: boolean;
        keysignPayload?: KeysignPayload;
        customMessagePayload?: CustomMessagePayload;
      } = {
        sessionId: transaction.id,
        serviceName: "VultiConnect",
        encryptionKeyHex: this.encryptionKeyHex(),
        useVultisigRelay: true,
      };
      if (transaction.isCustomMessage) {
        messsage.customMessagePayload = {
          $typeName: "vultisig.keysign.v1.CustomMessagePayload",
          method: "personal_sign",
          message: transaction.customMessage?.message,
        };
      } else {
        messsage.keysignPayload = this.keysignPayload;
      }
      const keysignMessage = create(KeysignMessageSchema, messsage);

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

  public getCustomMessageSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R).reverse();
    const sData = this.walletCore.HexCoding.decode(signature.S).reverse();
    const combinedData = new Uint8Array(rData.length + sData.length);
    combinedData.set(rData);
    combinedData.set(sData, rData.length);
    return combinedData;
  }

  public getEncodedSignature(signature: SignatureProps): string {
    return this.stripHexPrefix(
      this.walletCore.HexCoding.encode(
        this.getCustomMessageSignature(signature)
      )
    );
  }
}

import { randomBytes } from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";
import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import Long from "long";
import {
  THORChainSpecificSchema,
  type THORChainSpecific,
} from "~protos/blockchain_specific_pb";
import { CoinSchema, type Coin } from "~protos/coin_pb";
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import { ChainKey } from "~utils/constants";
import type {
  SignatureProps,
  SpecificThorchain,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import api from "./api";
import { createHash } from "crypto";
import { SignedTransactionResult } from "./signed-transaction-result";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class ThorchainTransactionProvider {
  private keysignPayload: KeysignPayload;

  constructor(
    private chainKey: ChainKey,
    private chainRef: ChainRef,
    private dataEncoder: (data: Uint8Array) => Promise<string>,
    private walletCore: WalletCore
  ) {
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  private encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  public getSpecificTransactionInfo = (
    coin: Coin
  ): Promise<SpecificThorchain> => {
    return new Promise<SpecificThorchain>((resolve) => {
      api.thorchain.fetchAccountNumber(coin.address).then((accountData) => {
        this.calculateFee(coin).then((fee) => {
          const specificThorchain: SpecificThorchain = {
            fee,
            gasPrice: fee,
            accountNumber: Number(accountData?.accountNumber),
            sequence: Number(accountData.sequence ?? 0),
            isDeposit: false,
          } as SpecificThorchain;

          resolve(specificThorchain);
        });
      });
    });
  };

  public getKeysignPayload = (
    transaction: TransactionProps,
    vault: VaultProps
  ): Promise<KeysignPayload> => {
    return new Promise((resolve, reject) => {
      const coin = create(CoinSchema, {
        chain: transaction.chain.name,
        ticker: transaction.chain.ticker,
        address: transaction.from,
        decimals: transaction.chain.decimals,
        hexPublicKey: vault.chains.find(
          (chain) => chain.name === transaction.chain.name
        ).derivationKey,
        isNativeToken: true,
        logo: transaction.chain.ticker.toLowerCase(),
      });
      this.getSpecificTransactionInfo(coin).then((specificData) => {
        const thorchainSpecific = create(THORChainSpecificSchema, {
          accountNumber: BigInt(specificData.accountNumber),
          fee: BigInt(specificData.fee),
          isDeposit: specificData.isDeposit,
          sequence: BigInt(specificData.sequence),
        });

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.to,
          toAmount: transaction.value
            ? BigInt(parseInt(transaction.value)).toString()
            : "0",
          memo: transaction.data,
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: "VultiConnect",
          coin,
          blockchainSpecific: {
            case: "thorchainSpecific",
            value: thorchainSpecific,
          },
        });
        this.keysignPayload = keysignPayload;
        resolve(keysignPayload);
      });
    });
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

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const thorchainSpecific = this.keysignPayload.blockchainSpecific
        .value as unknown as THORChainSpecific;
      let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
      let message: TW.Cosmos.Proto.Message[];
      const coinType = this.walletCore.CoinType.thorchain;
      const pubKeyData = Buffer.from(
        this.keysignPayload.coin.hexPublicKey,
        "hex"
      );
      const fromAddr = this.walletCore.AnyAddress.createWithString(
        this.keysignPayload.coin.address,
        this.walletCore.CoinType.thorchain
      );
      if (thorchainSpecific.isDeposit) {
        thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
          asset: TW.Cosmos.Proto.THORChainAsset.create({
            chain: "THOR",
            symbol: "RUNE",
            ticker: "RUNE",
            synth: false,
          }),
          decimals: new Long(8),
        });
        const toAmount = Number(this.keysignPayload.toAmount || "0");
        if (toAmount > 0) {
          thorchainCoin.amount = this.keysignPayload.toAmount;
        }

        message = [
          TW.Cosmos.Proto.Message.create({
            thorchainDepositMessage:
              TW.Cosmos.Proto.Message.THORChainDeposit.create({
                signer: fromAddr.data(),
                memo: this.keysignPayload.memo || "",
                coins: [thorchainCoin],
              }),
          }),
        ];
      } else {
        const toAddress = this.walletCore.AnyAddress.createWithString(
          this.keysignPayload.toAddress,
          coinType
        );
        if (!toAddress) {
          throw new Error("invalid to address");
        }
        message = [
          TW.Cosmos.Proto.Message.create({
            thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
              fromAddress: fromAddr.data(),
              amounts: [
                TW.Cosmos.Proto.Amount.create({
                  denom: "rune",
                  amount: this.keysignPayload.toAmount,
                }),
              ],
              toAddress: toAddress.data(),
            }),
          }),
        ];
      }

      var chainID = this.walletCore.CoinTypeExt.chainId(coinType);
      api.thorchain.getTHORChainChainID().then((thorChainId) => {
        if (thorChainId && chainID != thorChainId) {
          chainID = thorChainId;
        }

        const input = TW.Cosmos.Proto.SigningInput.create({
          publicKey: new Uint8Array(pubKeyData),
          signingMode: SigningMode.Protobuf,
          chainId: chainID,
          accountNumber: new Long(Number(thorchainSpecific.accountNumber)),
          sequence: new Long(Number(thorchainSpecific.sequence)),
          mode: BroadcastMode.SYNC,
          memo: this.keysignPayload.memo || "",
          messages: message,
          fee: TW.Cosmos.Proto.Fee.create({
            gas: new Long(20000000),
          }),
        });
        resolve(TW.Cosmos.Proto.SigningInput.encode(input).finish());
      });
    });
  };

  public getSignedTransaction = (
    transaction: TransactionProps,
    signature: SignatureProps,
    inputData: Uint8Array,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve) => {
      const coinType = this.walletCore.CoinType.thorchain;
      const allSignatures = this.walletCore.DataVector.create();
      const publicKeys = this.walletCore.DataVector.create();
      const pubkeyThorchain = vault.chains.find(
        (chain) => chain.name === ChainKey.THORCHAIN
      ).derivationKey;
      const publicKeyData = Buffer.from(pubkeyThorchain, "hex");
      const modifiedSig = this.getSignature(signature);
      allSignatures.add(modifiedSig);
      publicKeys.add(publicKeyData);
      const compileWithSignatures =
        this.walletCore.TransactionCompiler.compileWithSignatures(
          coinType,
          inputData,
          allSignatures,
          publicKeys
        );
      const output = TW.Cosmos.Proto.SigningOutput.decode(
        compileWithSignatures
      );
      const serializedData = output.serialized;
      const parsedData = JSON.parse(serializedData);
      const txBytes = parsedData.tx_bytes;
      const decodedTxBytes = Buffer.from(txBytes, "base64");
      const hash = createHash("sha256")
        .update(decodedTxBytes as any)
        .digest("hex");
      const result = new SignedTransactionResult(
        serializedData,
        hash,
        undefined
      );
      resolve(result.transactionHash);
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
  
  private getSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R);
    const sData = this.walletCore.HexCoding.decode(signature.S);
    const recoveryIDdata = this.walletCore.HexCoding.decode(
      signature.RecoveryID
    );
    const combinedData = new Uint8Array(
      rData.length + sData.length + recoveryIDdata.length
    );
    combinedData.set(rData);
    combinedData.set(sData, rData.length);
    combinedData.set(recoveryIDdata, rData.length + sData.length);
    return combinedData;
  }
  
  private calculateFee(_coin?: Coin): Promise<number> {
    return new Promise((resolve, reject) => {
      api.thorchain.getFeeData().then((feeData) => {
        resolve(Number(feeData));
      });
    });
  }
}
